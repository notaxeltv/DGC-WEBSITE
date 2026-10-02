/** Marketplace dove la singola carta può avere un annuncio diretto */
export const MARKETS = ["cardtrader", "cardmarket", "vinted", "ebay"] as const;
export type MarketId = (typeof MARKETS)[number];

export interface Card {
  id: string;
  name: string;
  set: string;
  number: string;
  japanese: boolean;
  game: string;
  condition: string;
  language: string;
  /** Testo di rarità come è salvato (es. "Rare Holo"). */
  rarity: string;
  /** Id normalizzato per i filtri (es. "holo-rare"). Vuoto se manca. */
  rarityId: string;
  /**
   * Tipo di reverse. Vuoto = non è una reverse.
   * epoca = timbro del set (EX Team Rocket Returns e set EX simili).
   * moderna = da Evoluzioni a Paldea in poi.
   * generica = reverse di un altro motivo, o tipo non indicato.
   */
  reverse: "" | "epoca" | "moderna" | "generica";
  price: number | null;
  quantity: number;
  image: string | null;
  foil: boolean;
  updatedAt: string | null;
  createdAt: string | null;
  /** link diretti all'annuncio della carta sui marketplace (solo quelli presenti) */
  links: Partial<Record<MarketId, string>>;
}
