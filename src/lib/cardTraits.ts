/**
 * Rarità (come il menu di CardMarket) e tipo di reverse.
 * La reverse NON è una rarità e NON si deduce da is_foil:
 * la rara olografica ha il foil sull'illustrazione,
 * la reverse ha il foil sul resto della carta.
 */

export interface Rarity {
  id: string;
  label: string;
}

/** Voci del menu Rarità di CardMarket, più Iper rara e Mega ultra rara. */
export const RARITIES: Rarity[] = [
  { id: "secret-rare", label: "Rara segreta" },
  { id: "special-illustration-rare", label: "Rara illustrazione speciale" },
  { id: "rainbow-rare", label: "Rara arcobaleno" },
  { id: "shiny-ultra-rare", label: "Rara ultra lucente" },
  { id: "ultra-rare", label: "Ultra rara" },
  { id: "character-super-rare", label: "Rara personaggio super" },
  { id: "illustration-rare", label: "Rara illustrazione" },
  { id: "character-rare", label: "Rara personaggio" },
  { id: "ace-rare", label: "Rara ACE" },
  { id: "shiny-rare", label: "Rara lucente" },
  { id: "amazing-rare", label: "Rara straordinaria" },
  { id: "kagayaku", label: "Kagayaku" },
  { id: "triple-rare", label: "Tripla rara" },
  { id: "double-rare", label: "Doppia rara" },
  { id: "mega-ultra-rare", label: "Mega ultra rara" },
  { id: "hyper-rare", label: "Iper rara" },
  { id: "holo-rare", label: "Rara olografica" },
  { id: "rare", label: "Rara" },
  { id: "uncommon", label: "Non comune" },
  { id: "common", label: "Comune" },
  { id: "promo", label: "Promo" },
  { id: "prize-pack", label: "Prize Pack" },
  { id: "fixed", label: "Fissa" },
  { id: "world-championship", label: "Mazzo World Championship" },
  { id: "online-code", label: "Codice online" },
  { id: "oversized", label: "Oversize" },
  { id: "pikachu-rare", label: "Rara Pikachu" },
  { id: "unknown", label: "Sconosciuta" },
];

const RARITY_BY_ID = new Map(RARITIES.map((r) => [r.id, r]));

/** Confronta ignorando maiuscole, accenti e punteggiatura. */
export function norm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const ALIAS: Record<string, string> = {};

function alias(id: string, ...names: string[]) {
  for (const name of names) ALIAS[norm(name)] = id;
}

alias("secret-rare", "Secret Rare", "Rara segreta", "Segreta", "SR");
alias("special-illustration-rare", "Special Illustration Rare", "Rara illustrazione speciale", "Illustrazione speciale", "SIR", "SAR");
alias("rainbow-rare", "Rainbow Rare", "Rara arcobaleno", "Arcobaleno");
alias("shiny-ultra-rare", "Shiny Ultra Rare", "Rara ultra lucente", "Ultra lucente");
alias("ultra-rare", "Ultra Rare", "Ultra rara", "UR");
alias("character-super-rare", "Character Super Rare", "Rara personaggio super", "Personaggio super", "CSR");
alias("illustration-rare", "Illustration Rare", "Rara illustrazione", "Illustrazione rara", "IR", "AR");
alias("character-rare", "Character Rare", "Rara personaggio", "Personaggio rara", "CHR");
alias("ace-rare", "ACE Rare", "Rara ACE", "ACE");
alias("shiny-rare", "Shiny Rare", "Rara lucente", "Lucente");
alias("amazing-rare", "Amazing Rare", "Rara straordinaria", "Straordinaria");
alias("kagayaku", "Kagayaku");
alias("triple-rare", "Triple Rare", "Tripla rara", "Tripla");
alias("double-rare", "Double Rare", "Doppia rara", "Doppia", "RR");
alias("mega-ultra-rare", "Mega Ultra Rare", "Mega Hyper Rare", "Mega ultra rara", "Mega iper rara");
alias("hyper-rare", "Hyper Rare", "Iper rara", "Gold Hyper Rare", "Rara gold", "HR");
alias("holo-rare", "Holo Rare", "Rare Holo", "Rara olografica", "Rara holo", "Holo", "Olografica");
alias("rare", "Rare", "Rara", "R");
alias("uncommon", "Uncommon", "Non comune", "UC");
alias("common", "Common", "Comune", "C");
alias("promo", "Promo", "Promozionale");
alias("prize-pack", "Prize Pack Series", "Prize Pack", "Premio");
alias("fixed", "Fixed", "Fissa");
alias("world-championship", "World Championship Deck", "World Championship", "Mazzo World Championship", "WCD");
alias("online-code", "Online Code Card", "Online Code", "Codice online");
alias("oversized", "Oversized", "Oversize", "Jumbo");
alias("pikachu-rare", "Pikachu Rare", "Rara Pikachu");
alias("unknown", "Unknown", "Sconosciuta", "Sconosciuto");

/** Id stabile per filtrare. Le rarità fuori elenco restano un id proprio (es. Mythic). */
export function rarityId(raw: string): string {
  const key = norm(raw);
  if (!key) return "";
  return ALIAS[key] ?? key.replace(/ /g, "-");
}

/** Etichetta italiana se la rarità è nota, altrimenti il testo originale. */
export function rarityLabel(raw: string): string {
  const id = RARITY_BY_ID.has(raw) ? raw : rarityId(raw);
  return RARITY_BY_ID.get(id)?.label ?? raw.trim();
}

/**
 * Tre soli casi, distinti dalla rarità e dal foil.
 * - stamped: reverse con il timbro del set sulla carta.
 * - reverse: le altre reverse.
 * - vuoto: non è una reverse.
 */
export type ReverseStyle = "reverse" | "stamped";

const STAMPED = ["stamped", "stamp", "timbro", "set stamp", "set logo", "logo del set", "epoca", "rocket returns", "ex team rocket"];
const AS_REVERSE = ["moderna", "moderno", "generica", "poke ball", "pokeball", "master ball", "masterball", "paldea"];
const REVERSE = new Set(["reverse", "reverse holo", "rh", "rev", "si", "yes", "y", "true", "1", ...AS_REVERSE]);
const NOT_REVERSE = new Set(["no", "non", "false", "0", "n", "standard", "normale", "regular", "base"]);

function hasPhrase(key: string, phrases: string[]) {
  return phrases.some((phrase) => key === phrase || key.includes(phrase));
}

export function reverseStyle(raw: unknown): ReverseStyle | "" {
  if (raw === true) return "reverse";
  if (raw === false || raw === null || raw === undefined) return "";
  const key = norm(String(raw));
  if (!key || NOT_REVERSE.has(key)) return "";
  if (key.startsWith("non ") || key.startsWith("no ") || key.startsWith("senza ")) return "";
  if (hasPhrase(key, STAMPED)) return "stamped";
  if (hasPhrase(key, AS_REVERSE) || REVERSE.has(key) || key.includes("reverse")) return "reverse";
  return "";
}

export function reverseLabel(style: ReverseStyle | ""): string {
  if (style === "stamped") return "Stamped";
  if (style === "reverse") return "Reverse";
  return "";
}

export function reverseDetail(style: ReverseStyle | ""): string {
  if (style === "stamped") return "Stamped";
  if (style === "reverse") return "Reverse";
  return "";
}
