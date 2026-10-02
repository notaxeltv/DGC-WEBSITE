import { useEffect, useState } from "react";
import { siCardmarket, siEbay, siInstagram, siTiktok, siVinted, siWhatsapp } from "simple-icons";
import { SITE } from "../config";

type Channel = keyof typeof SITE.contacts;

export interface Def {
  label: string;
  /** percorso SVG (viewBox 24x24) oppure file immagine in /public/social */
  path?: string;
  image?: string;
  /** testo mostrato se l'immagine non è ancora presente */
  initials?: string;
  href: (value: string) => string;
}

// Icona "busta" per l'email (disegnata a mano, non è un marchio)
const MAIL_PATH = "M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.4 2L12 12.6 19.6 7H4.4Zm15.6 1.9-7.4 5.4a1 1 0 0 1-1.2 0L4 8.9V17h16V8.9Z";

export const CHANNELS: Record<Channel, Def> = {
  whatsapp: { label: "WhatsApp", path: siWhatsapp.path, href: (v) => v },
  instagram: { label: "Instagram", path: siInstagram.path, href: (v) => v },
  tiktok: { label: "TikTok", path: siTiktok.path, href: (v) => v },
  cardtrader: { label: "CardTrader", image: "/social/cardtrader.png", initials: "CT", href: (v) => v },
  cardmarket: { label: "Cardmarket", path: siCardmarket.path, href: (v) => v },
  ebay: { label: "eBay", path: siEbay.path, href: (v) => v },
  vinted: { label: "Vinted", path: siVinted.path, href: (v) => v },
  email: { label: "Email", path: MAIL_PATH, href: (v) => `mailto:${v}` },
};

export function Icon({ def }: { def: Def }) {
  const [imageOk, setImageOk] = useState(false);

  // Verifica che il file immagine esista; se manca si usa la sigla
  useEffect(() => {
    if (!def.image) return;
    const img = new Image();
    img.onload = () => setImageOk(true);
    img.onerror = () => setImageOk(false);
    img.src = def.image;
  }, [def.image]);

  if (def.path) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d={def.path} />
      </svg>
    );
  }
  if (def.image && imageOk) {
    // L'immagine fa da maschera: conta solo la forma, il colore è quello del sito (currentColor)
    return (
      <span
        className="social__mask"
        aria-hidden
        style={{ WebkitMaskImage: `url(${def.image})`, maskImage: `url(${def.image})` }}
      />
    );
  }
  return <span className="social__initials">{def.initials}</span>;
}

interface Props {
  className?: string;
  /** In sviluppo mostra anche i canali senza link (attenuati), per vedere come verrà il sito */
  preview?: boolean;
}

export default function SocialLinks({ className = "", preview = false }: Props) {
  const all = Object.keys(CHANNELS) as Channel[];
  const items = preview && import.meta.env.DEV ? all : all.filter((k) => SITE.contacts[k]);
  if (items.length === 0) return null;

  return (
    <ul className={`social ${className}`}>
      {items.map((k) => {
        const def = CHANNELS[k];
        const value = SITE.contacts[k];
        if (!value) {
          return (
            <li key={k}>
              <span className="social__link social__link--empty" title={`${def.label} (link da inserire in config.ts)`}>
                <Icon def={def} />
              </span>
            </li>
          );
        }
        const href = def.href(value);
        return (
          <li key={k}>
            <a
              href={href}
              className={`social__link social__link--${k}`}
              aria-label={def.label}
              title={def.label}
              {...(k === "email" ? {} : { target: "_blank", rel: "noreferrer" })}
            >
              <Icon def={def} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
