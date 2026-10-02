import { useEffect, useState } from "react";
import { SITE } from "../config";
import type { Wishlist, WishItem } from "../hooks/useWishlist";
import { formatPrice } from "./CardItem";
import SocialLinks from "./SocialLinks";

const describe = (i: WishItem) =>
  [i.set && i.number ? `${i.set} #${i.number}` : i.set, i.condition, i.language, i.japanese && "JP", i.foil && "Foil"]
    .filter(Boolean)
    .join(", ");

function buildMessage(items: WishItem[]) {
  const lines = items.map((i) => {
    const price = i.price !== null ? ` – ${formatPrice(i.price)}` : "";
    return `- ${i.qty}x ${i.name} (${describe(i)})${price}`;
  });
  const priced = items.every((i) => i.price !== null);
  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  return [
    "Ciao, vorrei richiedere queste carte:",
    "",
    ...lines,
    ...(priced ? ["", `Totale indicativo: ${formatPrice(total)}`] : []),
    "",
    "Grazie!",
  ].join("\n");
}

export default function WishlistPanel({ wishlist }: { wishlist: Wishlist }) {
  const { items, count, setQty, remove, clear } = wishlist;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Se la lista si svuota, chiudi il pannello
  useEffect(() => {
    if (items.length === 0) setOpen(false);
  }, [items.length]);

  if (items.length === 0) return null;

  const message = buildMessage(items);
  const pricedAll = items.every((i) => i.price !== null);
  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  const email = SITE.contacts.email;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copia la lista:", message);
    }
  };

  return (
    <>
      <button className="wish-fab" onClick={() => setOpen(true)} aria-label="Apri la lista richieste">
        <span>Lista richieste</span>
        <strong>{count}</strong>
      </button>

      {open && (
        <div className="drawer" onClick={() => setOpen(false)}>
          <aside className="drawer__panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Lista richieste">
            <header className="drawer__head">
              <h2>La tua lista</h2>
              <button className="modal__close" onClick={() => setOpen(false)} aria-label="Chiudi">×</button>
            </header>

            <ul className="drawer__items">
              {items.map((i) => (
                <li key={i.id}>
                  <div className="drawer__info">
                    <strong>{i.name}</strong>
                    <span>{describe(i)}</span>
                    {i.price !== null && <span className="drawer__price">{formatPrice(i.price)}</span>}
                  </div>
                  <div className="qty">
                    <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Meno">−</button>
                    <span>{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= i.max} aria-label="Più">+</button>
                  </div>
                  <button className="drawer__remove" onClick={() => remove(i.id)} aria-label="Rimuovi">🗑</button>
                </li>
              ))}
            </ul>

            <footer className="drawer__foot">
              {pricedAll && (
                <p className="drawer__total">
                  Totale indicativo <strong>{formatPrice(total)}</strong>
                </p>
              )}
              <p className="drawer__hint">
                Questa non è una prenotazione: la disponibilità e il prezzo vanno confermati con noi.
              </p>

              {email && (
                <a
                  className="btn btn--primary"
                  href={`mailto:${email}?subject=${encodeURIComponent("Richiesta carte")}&body=${encodeURIComponent(message)}`}
                >
                  Invia la lista per email
                </a>
              )}
              <button className="btn btn--outline" onClick={copy}>
                {copied ? "Lista copiata ✓" : "Copia la lista"}
              </button>
              <p className="drawer__hint">Poi incollala nel canale che preferisci:</p>
              <SocialLinks />
              <button className="link drawer__clear" onClick={clear}>Svuota la lista</button>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
