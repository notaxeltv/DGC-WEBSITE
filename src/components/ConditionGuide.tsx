import { useEffect } from "react";
import { CONDITION_GUIDE, CONDITION_LABELS } from "../config";

/** Finestra con la spiegazione delle condizioni; mostra quelle presenti nel catalogo. */
export default function ConditionGuide({ present, onClose }: { present: string[]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const known = Object.keys(CONDITION_GUIDE);
  const inCatalog = known.filter((k) => present.includes(k));
  const codes = inCatalog.length > 0 ? inCatalog : known;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__dialog guide" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Guida alle condizioni">
        <button className="modal__close" onClick={onClose} aria-label="Chiudi">×</button>
        <div className="guide__body">
          <h2>Guida alle condizioni</h2>
          <p className="guide__lead">Come valutiamo lo stato delle carte.</p>
          <dl className="guide__list">
            {codes.map((c) => (
              <div key={c}>
                <dt><span className="tag">{c}</span> {CONDITION_LABELS[c]}</dt>
                <dd>{CONDITION_GUIDE[c]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
