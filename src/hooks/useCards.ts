import { useCallback, useEffect, useState } from "react";
import { CARDS_TABLE, COLUMNS, GROUP_IDENTICAL_COPIES, HIDE_OUT_OF_STOCK, MIN_PRICE, ONLY_WHERE, REFRESH_SECONDS } from "../config";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { MOCK_CARDS } from "../lib/mockData";
import { MARKETS, type Card, type MarketId } from "../lib/types";

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = "") =>
  v === null || v === undefined ? fallback : String(v);

/** Legge il valore di un campo dal nome colonna configurato (null = colonna assente) */
const get = (row: Row, col: string | null): unknown => (col ? row[col] : undefined);

/** Accetta solo link http(s): evita indirizzi anomali (es. "javascript:") salvati per errore nel database */
const safeUrl = (v: unknown): string | null => {
  const s = str(v).trim();
  return /^https?:\/\//i.test(s) ? s : null;
};

function toLinks(row: Row): Card["links"] {
  const raw: Record<MarketId, unknown> = {
    cardtrader: get(row, COLUMNS.cardtraderUrl),
    cardmarket: get(row, COLUMNS.cardmarketUrl),
    vinted: get(row, COLUMNS.vintedUrl),
    ebay: get(row, COLUMNS.ebayUrl),
  };
  const links: Card["links"] = {};
  for (const id of MARKETS) {
    const url = safeUrl(raw[id]);
    if (url) links[id] = url;
  }
  return links;
}

function toCard(row: Row): Card {
  const price = get(row, COLUMNS.price);
  const qty = get(row, COLUMNS.quantity);
  return {
    id: str(get(row, COLUMNS.id)),
    name: str(get(row, COLUMNS.name), "Senza nome"),
    set: str(get(row, COLUMNS.set)),
    number: str(get(row, COLUMNS.number)),
    japanese: Boolean(get(row, COLUMNS.japanese)),
    game: str(get(row, COLUMNS.game)),
    condition: str(get(row, COLUMNS.condition)),
    language: str(get(row, COLUMNS.language)),
    rarity: str(get(row, COLUMNS.rarity)),
    price: price === null || price === undefined ? null : Number(price),
    // senza colonna quantità, ogni riga è una copia
    quantity: COLUMNS.quantity ? Number(qty ?? 0) || 0 : 1,
    image: get(row, COLUMNS.image) ? str(get(row, COLUMNS.image)) : null,
    foil: Boolean(get(row, COLUMNS.foil)),
    updatedAt: get(row, COLUMNS.updatedAt) ? str(get(row, COLUMNS.updatedAt)) : null,
    createdAt: get(row, COLUMNS.createdAt) ? str(get(row, COLUMNS.createdAt)) : null,
    links: toLinks(row),
  };
}

/** Unisce le copie identiche sommando le quantità */
function groupCopies(cards: Card[]): Card[] {
  const map = new Map<string, Card>();
  for (const c of cards) {
    const key = [c.name, c.set, c.number, c.game, c.condition, c.language, c.japanese, c.rarity, c.foil, c.price].join("|");
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...c });
    } else {
      existing.quantity += c.quantity;
      if (!existing.image && c.image) existing.image = c.image;
      // tra le copie raggruppate si tiene il primo link disponibile per ogni marketplace
      existing.links = { ...c.links, ...existing.links };
      if ((c.updatedAt ?? "") > (existing.updatedAt ?? "")) existing.updatedAt = c.updatedAt;
      // per le copie raggruppate vale la data di inserimento più recente
      if ((c.createdAt ?? "") > (existing.createdAt ?? "")) existing.createdAt = c.createdAt;
    }
  }
  return Array.from(map.values());
}

const finalize = (cards: Card[]) => {
  // soglia di prezzo: via le carte sotto MIN_PRICE e quelle senza prezzo
  const priced = MIN_PRICE > 0 ? cards.filter((c) => c.price !== null && c.price >= MIN_PRICE) : cards;
  const grouped = GROUP_IDENTICAL_COPIES ? groupCopies(priced) : priced;
  return HIDE_OUT_OF_STOCK ? grouped.filter((c) => c.quantity > 0) : grouped;
};

/**
 * Solo in sviluppo: confronta le colonne di config.ts con quelle realmente
 * restituite da Supabase e segnala le differenze nella console del browser.
 */
function checkColumns(rows: Row[]) {
  if (rows.length === 0) {
    console.warn(
      `[DGC] La tabella "${CARDS_TABLE}" non ha restituito righe: è vuota oppure manca la policy di lettura (RLS) per "anon".`,
    );
    return;
  }
  const real = Object.keys(rows[0]);
  const missing = Object.entries(COLUMNS).filter(([, col]) => col && !real.includes(col));
  const unused = real.filter((col) => !Object.values(COLUMNS).includes(col));

  if (missing.length === 0) {
    console.info("[DGC] OK: tutte le colonne di config.ts esistono nel database.");
  } else {
    console.warn(
      "[DGC] Colonne in config.ts NON trovate nel database:\n" +
        missing.map(([field, col]) => `  • ${field} → "${col}"`).join("\n") +
        `\nColonne disponibili nel database: ${real.join(", ")}`,
    );
  }
  if (unused.length) console.info(`[DGC] Colonne del database non usate dal sito: ${unused.join(", ")}`);
}

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const demo = !isSupabaseConfigured;

  const load = useCallback(async () => {
    if (!supabase) {
      setCards(finalize(MOCK_CARDS));
      setLoading(false);
      return;
    }

    let query = supabase.from(CARDS_TABLE).select("*");
    if (HIDE_OUT_OF_STOCK && COLUMNS.quantity) query = query.gt(COLUMNS.quantity, 0);
    for (const [col, value] of Object.entries(ONLY_WHERE)) query = query.eq(col, value);
    // La soglia di prezzo si applica già nella richiesta: con molte carte da pochi centesimi
    // si eviterebbe altrimenti di scaricarle tutte (Supabase restituisce al massimo 1000 righe).
    if (MIN_PRICE > 0 && COLUMNS.price) query = query.gte(COLUMNS.price, MIN_PRICE);

    const { data, error } = await query;
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      const rows = data as Row[];
      if (import.meta.env.DEV) checkColumns(rows);
      setCards(finalize(rows.map(toCard)));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    if (!supabase) return;

    // Realtime non funziona sulle viste: il catalogo si ricarica ogni N secondi
    // e subito quando il visitatore torna sulla scheda del browser.
    const timer = window.setInterval(load, REFRESH_SECONDS * 1000);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return { cards, loading, error, demo };
}
