/**
 * Compila una carta Pokémon a partire dal codice set + numero
 * (es. "PAL 193", "sv2-193", "TRR-15", "PAL193").
 * I dati arrivano dal Pokémon TCG API. Nome, set e rarità restano
 * correggibili: il codice non dice lingua, condizione, foil o reverse.
 */

const API = "https://api.pokemontcg.io/v2";
const SET_CACHE_MS = 6 * 60 * 60 * 1000;

export interface CardDraft {
  name: string;
  setName: string;
  setCode: string;
  number: string;
  rarity: string;
  imageUrl: string | null;
  sourceId: string;
}

export type LookupResult =
  | { ok: true; card: CardDraft }
  | { ok: false; error: string };

interface PokeSet {
  id: string;
  name: string;
  ptcgoCode?: string;
}

interface PokeCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  images?: { small?: string; large?: string };
  set: PokeSet;
}

let setCache: { at: number; sets: PokeSet[] } | null = null;

/** "PAL 193", "sv2-193", "TRR-15/109", "PAL193". */
export function parseCardCode(raw: string): { set: string; number: string } | null {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return null;

  const separated = text.match(
    /^([a-z0-9]+)\s*[-\s]\s*([a-z]{0,6}\d+[a-z]?)(?:\s*\/\s*[a-z0-9]+)?$/i,
  );
  if (separated) return { set: separated[1], number: separated[2] };

  const glued = text.match(/^([a-z]{2,8})(\d+[a-z]?)$/i);
  if (glued) return { set: glued[1], number: glued[2] };

  return null;
}

function numberVariants(number: string): string[] {
  const raw = number.trim();
  const upper = raw.toUpperCase();
  const stripped = upper.replace(/^0+(?=\d)/, "");
  return [...new Set([raw, upper, stripped].filter(Boolean))];
}

async function pokeGet(path: string): Promise<{ status: number; json: unknown } | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${API}${path}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
      if (response.status === 404) return { status: 404, json: null };
      if (response.ok) return { status: response.status, json: await response.json() };
    } catch {
      /* riprova: l'API a volte risponde 500/502 */
    }
    await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
  }
  return null;
}

async function allSets(): Promise<PokeSet[]> {
  if (setCache && Date.now() - setCache.at < SET_CACHE_MS) return setCache.sets;

  const sets: PokeSet[] = [];
  for (let page = 1; page <= 4; page += 1) {
    const result = await pokeGet(`/sets?page=${page}&pageSize=250&select=id,name,ptcgoCode`);
    if (!result?.json) break;
    const body = result.json as { data?: PokeSet[]; totalCount?: number };
    sets.push(...(body.data ?? []));
    if (sets.length >= (body.totalCount ?? sets.length)) break;
  }

  if (sets.length > 0) setCache = { at: Date.now(), sets };
  return sets;
}

function setFromList(json: unknown, token: string): PokeSet | null {
  const key = token.toLowerCase();
  const sets = (json as { data?: PokeSet[] } | null)?.data ?? [];
  return (
    sets.find(
      (set) => set.id.toLowerCase() === key || (set.ptcgoCode ?? "").toLowerCase() === key,
    ) ?? null
  );
}

async function resolveSet(token: string): Promise<PokeSet | null> {
  const lowered = token.toLowerCase();
  // Gli id API contengono una cifra (sv2, base1, ex7). Un codice solo lettere
  // (PAL, TRR) non va chiesto come id: il 404 del browser non ha gli header CORS.
  if (/\d/.test(lowered)) {
    const direct = await pokeGet(`/sets/${encodeURIComponent(lowered)}`);
    const directSet = (direct?.json as { data?: PokeSet } | null)?.data;
    if (directSet?.id) return directSet;
  }

  const byCode = await pokeGet(
    `/sets?q=${encodeURIComponent(`ptcgoCode:${token.toUpperCase()}`)}&select=id,name,ptcgoCode&pageSize=5`,
  );
  const fromCode = setFromList(byCode?.json, token);
  if (fromCode) return fromCode;

  const sets = await allSets();
  return setFromList({ data: sets }, token);
}

async function getCard(id: string): Promise<PokeCard | null> {
  const result = await pokeGet(`/cards/${encodeURIComponent(id)}`);
  const card = (result?.json as { data?: PokeCard } | null)?.data;
  return card?.name ? card : null;
}

export async function lookupCardByCode(raw: string): Promise<LookupResult> {
  const parsed = parseCardCode(raw);
  if (!parsed) {
    return {
      ok: false,
      error: "Usa il codice del set e il numero, per esempio PAL 193, sv2-193 o TRR-15.",
    };
  }

  const expansion = await resolveSet(parsed.set);
  if (!expansion) {
    return {
      ok: false,
      error: "Set non trovato. Controlla il codice oppure compila i campi a mano.",
    };
  }

  let card: PokeCard | null = null;
  for (const number of numberVariants(parsed.number)) {
    card = await getCard(`${expansion.id}-${number}`);
    if (card) break;
  }

  if (!card) {
    return {
      ok: false,
      error: "Nessuna carta con questo numero nel set. Puoi compilare i campi a mano.",
    };
  }

  return {
    ok: true,
    card: {
      name: card.name,
      setName: card.set.name,
      setCode: card.set.ptcgoCode || expansion.ptcgoCode || card.set.id,
      number: card.number,
      rarity: card.rarity ?? "",
      imageUrl: card.images?.large || card.images?.small || null,
      sourceId: card.id,
    },
  };
}
