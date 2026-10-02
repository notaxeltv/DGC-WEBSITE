import { useCallback, useEffect, useMemo, useState } from "react";
import { rarityLabel, reverseLabel } from "../lib/cardTraits";
import type { Card } from "../lib/types";

const KEY = "dgc-wishlist";

export interface WishItem {
  id: string;
  name: string;
  set: string;
  number: string;
  condition: string;
  language: string;
  rarity?: string;
  reverse?: string;
  foil: boolean;
  japanese: boolean;
  price: number | null;
  qty: number;
  /** copie disponibili al momento dell'aggiunta */
  max: number;
}

function load(): WishItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WishItem[]) : [];
  } catch {
    return [];
  }
}

/** Lista richieste: resta salvata nel browser del visitatore (nessun dato va sui tuoi server). */
export function useWishlist() {
  const [items, setItems] = useState<WishItem[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* browser in navigazione privata: la lista vale solo per la sessione */
    }
  }, [items]);

  const add = useCallback((card: Card) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === card.id);
      if (found) {
        return prev.map((i) =>
          i.id === card.id ? { ...i, max: card.quantity, qty: Math.min(i.qty + 1, card.quantity) } : i,
        );
      }
      return [
        ...prev,
        {
          id: card.id,
          name: card.name,
          set: card.set,
          number: card.number,
          condition: card.condition,
          language: card.language,
          rarity: rarityLabel(card.rarity),
          reverse: reverseLabel(card.reverse),
          foil: card.foil,
          japanese: card.japanese,
          price: card.price,
          qty: 1,
          max: card.quantity,
        },
      ];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.flatMap((i) => (i.id !== id ? [i] : qty <= 0 ? [] : [{ ...i, qty: Math.min(qty, i.max) }])),
    );
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return { items, add, setQty, remove, clear, count };
}

export type Wishlist = ReturnType<typeof useWishlist>;
