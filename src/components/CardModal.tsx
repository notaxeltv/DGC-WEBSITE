import { useEffect } from "react";
import { CONDITION_LABELS } from "../config";
import { MARKETS, type Card } from "../lib/types";
import { CardImage, formatPrice } from "./CardItem";
import { CHANNELS, Icon } from "./SocialLinks";

interface Props {
  card: Card;
  onClose: () => void;
  onAdd: (card: Card) => void;
  /** quante copie di questa carta sono già nella lista richieste */
  inList: number;
}

export default function CardModal({ card, onClose, onAdd, inList }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const rows: [string, string][] = [
    ["Gioco", card.game],
    ["Espansione", card.set],
    ["Numero", card.number],
    ["Rarità", card.rarity],
    ["Condizione", card.condition ? `${card.condition}${CONDITION_LABELS[card.condition] ? ` – ${CONDITION_LABELS[card.condition]}` : ""}` : ""],
    ["Lingua", card.language],
    ["Edizione giapponese", card.japanese ? "Sì" : ""],
    ["Foil", card.foil ? "Sì" : ""],
  ];

  const markets = MARKETS.filter((m) => card.links[m]);
  const available = card.quantity > 0;
  const maxReached = inList >= card.quantity;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={card.name}>
        <button className="modal__close" onClick={onClose} aria-label="Chiudi">×</button>
        <div className="modal__media">
          <CardImage card={card} />
        </div>
        <div className="modal__info">
          <h2>{card.name}</h2>
          {card.price !== null && <p className="modal__price">{formatPrice(card.price)}</p>}
          <p className={`modal__stock ${available ? "" : "is-out"}`}>
            {available ? `${card.quantity} ${card.quantity === 1 ? "copia disponibile" : "copie disponibili"}` : "Attualmente esaurita"}
          </p>
          <dl className="modal__list">
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          {markets.length > 0 && (
            <div className="market">
              <p className="market__label">Vedi l'annuncio su</p>
              <ul className="market__list">
                {markets.map((m) => (
                  <li key={m}>
                    <a className="market__btn" href={card.links[m]} target="_blank" rel="noreferrer noopener">
                      <Icon def={CHANNELS[m]} />
                      <span>{CHANNELS[m].label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {available && (
            <>
              <button className="btn btn--primary" onClick={() => onAdd(card)} disabled={maxReached}>
                {maxReached ? "Tutte le copie sono in lista" : "Aggiungi alla lista"}
              </button>
              {inList > 0 && <p className="modal__inlist">Nella tua lista: {inList}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
