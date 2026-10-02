import { HAS_CONTACTS, LEGAL, SITE } from "../config";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  const hasLegal = Object.values(LEGAL).some(Boolean);
  return (
    <>
      <section className="section section--alt" id="chi-siamo">
        <div className="container about">
          <h2 className="section__title">Chi siamo</h2>
          <p>
            {SITE.name} è il punto di riferimento per collezionisti e giocatori: compriamo, vendiamo
            e scambiamo carte singole in ogni condizione. Ogni carta in catalogo è descritta con
            condizione, lingua e disponibilità reali.
          </p>
        </div>
      </section>

      <footer className="footer" id="contatti">
        <div className="container footer__inner">
          <img src="/logo.png" alt={SITE.name} className="footer__logo" />
          {(HAS_CONTACTS || import.meta.env.DEV) && (
            <div className="footer__contacts">
              <h3>Seguici e contattaci</h3>
              <SocialLinks preview />
            </div>
          )}
        </div>
        {hasLegal && (
          <p className="footer__legal">
            {[LEGAL.businessName, LEGAL.vat && `P.IVA ${LEGAL.vat}`, LEGAL.address].filter(Boolean).join(" · ")}
            {LEGAL.privacyUrl && <> · <a href={LEGAL.privacyUrl} target="_blank" rel="noreferrer">Privacy</a></>}
            {LEGAL.cookieUrl && <> · <a href={LEGAL.cookieUrl} target="_blank" rel="noreferrer">Cookie</a></>}
          </p>
        )}
        {!hasLegal && import.meta.env.DEV && (
          <p className="footer__legal footer__legal--hint">
            Anteprima: qui compariranno i dati legali (compilali in <code>LEGAL</code> dentro src/config.ts).
          </p>
        )}
        <p className="footer__copy">© {new Date().getFullYear()} {SITE.name}. Tutti i diritti riservati.</p>
      </footer>
    </>
  );
}
