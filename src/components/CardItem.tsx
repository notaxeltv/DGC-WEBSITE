import { CONDITION_LABELS } from "../config";
import type { Card } from "../lib/types";

export const formatPrice = (p: number | null) =>
  p === null || Number.isNaN(p)
    ? ""
    : new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(p);

export function CardImage({ card }: { card: Card }) {
  if (!card.image) {
    return (
      <div className="card__placeholder" aria-hidden>
        <span>👻</span>
      </div>
    );
  }
  return <img src={card.image} alt={card.name} loading="lazy" />;
}

interface Props {
  card: Card;
  onOpen: (card: Card) => void;
}

export default function CardItem({ card, onOpen }: Props) {
  const out = card.quantity <= 0;
  const low = !out && card.quantity <= 2;

  return (
    <button className={`card ${out ? "card--out" : ""}`} onClick={() => onOpen(card)}>
      <div className="card__media">
        <CardImage card={card} />
        {card.foil && <span className="card__badge card__badge--foil">Foil</span>}
        {out && <span className="card__badge card__badge--out">Esaurita</span>}
      </div>
      <div className="card__body">
        <h3 className="card__name">{card.name}</h3>
        <p className="card__set">
          {[card.set, card.number && `#${card.number}`, card.game].filter(Boolean).join(" · ")}
        </p>
        <div className="card__tags">
          {card.condition && (
            <span className="tag" title={CONDITION_LABELS[card.condition]}>{card.condition}</span>
          )}
          {card.language && <span className="tag">{card.language}</span>}
          {card.japanese && <span className="tag">JP</span>}
        </div>
        <div className="card__footer">
          <span className="card__price">{formatPrice(card.price)}</span>
          <span className={`card__stock ${low ? "is-low" : ""}`}>
            {out ? "—" : low ? `Ultime ${card.quantity}` : `${card.quantity} disp.`}
          </span>
        </div>
      </div>
    </button>
  );
}
