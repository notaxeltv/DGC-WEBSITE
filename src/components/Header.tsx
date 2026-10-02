import { useEffect, useState } from "react";
import { HAS_CONTACTS, SITE } from "../config";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`header ${scrolled ? "header--solid" : ""}`}>
      <a href="#top" className="header__brand" onClick={close}>
        <img src="/logo.png" alt="" className="header__logo" />
        <span>{SITE.name}</span>
      </a>
      <button className="header__burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
        <span /><span /><span />
      </button>
      <nav className={`header__nav ${open ? "is-open" : ""}`}>
        <a href="#catalogo" onClick={close}>Catalogo</a>
        <a href="#chi-siamo" onClick={close}>Chi siamo</a>
        {HAS_CONTACTS && <a href="#contatti" onClick={close}>Contatti</a>}
      </nav>
    </header>
  );
}
