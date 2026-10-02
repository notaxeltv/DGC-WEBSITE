import { rarityId, type ReverseStyle } from "./cardTraits";
import type { Card } from "./types";

/** Dati dimostrativi, usati solo se Supabase non è ancora configurato. */
const base = (
  id: string,
  name: string,
  set: string,
  game: string,
  condition: string,
  language: string,
  rarity: string,
  price: number,
  quantity: number,
  foil = false,
  reverse: ReverseStyle | "" = "",
): Card => ({
  id,
  name,
  set,
  number: id.padStart(3, "0"),
  japanese: false,
  game,
  condition,
  language,
  rarity,
  rarityId: rarityId(rarity),
  reverse,
  price,
  quantity,
  image: null,
  foil,
  updatedAt: null,
  links: {},
  // date finte, solo per la demo: la carta "1" è la più recente
  createdAt: new Date(Date.now() - Number(id) * 86_400_000).toISOString(),
});

export const MOCK_CARDS: Card[] = [
  base("1", "Charizard", "Base Set", "Pokémon", "NM", "EN", "Rare Holo", 349.9, 1, true),
  base("2", "Black Lotus", "Alpha", "Magic", "EX", "EN", "Rare", 24999, 1),
  base("3", "Blue-Eyes White Dragon", "LOB", "Yu-Gi-Oh!", "NM", "IT", "Ultra Rare", 89.5, 2, true),
  base("4", "Lightning Bolt", "Modern Horizons 3", "Magic", "NM", "EN", "Uncommon", 1.5, 24),
  base("5", "Pikachu VMAX", "Vivid Voltage", "Pokémon", "NM", "IT", "Secret Rare", 42, 3, true),
  base("6", "Dark Magician", "LOB", "Yu-Gi-Oh!", "SP", "IT", "Ultra Rare", 35, 4),
  base("7", "Sheoldred, the Apocalypse", "Dominaria United", "Magic", "NM", "EN", "Mythic", 58, 5, true),
  base("8", "Mewtwo", "Base Set", "Pokémon", "LP", "EN", "Rare Holo", 120, 0, true),
  base("9", "Dark Dragonite", "EX Team Rocket Returns", "Pokémon", "NM", "EN", "Rare", 48, 1, false, "stamped"),
  base("10", "Squawkabilly", "Paldea Evolved", "Pokémon", "NM", "IT", "Uncommon", 22, 2, false, "reverse"),
  base("11", "Squawkabilly", "Paldea Evolved", "Pokémon", "NM", "IT", "Uncommon", 22, 1),
  base("12", "Gloom", "Legendary Collection", "Pokémon", "NM", "EN", "Common", 24, 1, false, "reverse"),
];
