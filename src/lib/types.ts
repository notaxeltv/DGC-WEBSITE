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
  rarity: string;
  price: number | null;
  quantity: number;
  image: string | null;
  foil: boolean;
  updatedAt: string | null;
  createdAt: string | null;
  /** link diretti all'annuncio della carta sui marketplace (solo quelli presenti) */
  links: Partial<Record<MarketId, string>>;
}
