import { HAS_CONTACTS, SITE } from "../config";
interface Props {
  totalCards: number;
  totalCopies: number;
}

export default function Hero({ totalCards, totalCopies }: Props) {
  return (
    <section className="hero" id="top">
      <div className="hero__smoke" aria-hidden />
      <div className="hero__inner">
        <img src="/logo.png" alt={SITE.name} className="hero__logo" />
        <p className="hero__tagline">{SITE.tagline}</p>
        <div className="hero__actions">
          <a href="#catalogo" className="btn btn--primary">Esplora il catalogo</a>
          {HAS_CONTACTS && <a href="#contatti" className="btn btn--outline">Contattaci</a>}
        </div>
        <ul className="hero__stats">
          <li><strong>{totalCards}</strong><span>carte a catalogo</span></li>
          <li><strong>{totalCopies}</strong><span>copie disponibili</span></li>
          <li><strong>100%</strong><span>aggiornato in tempo reale</span></li>
        </ul>
      </div>
      <a href="#catalogo" className="hero__scroll" aria-label="Scorri">⌄</a>
    </section>
  );
}
