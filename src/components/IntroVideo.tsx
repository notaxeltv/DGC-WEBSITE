import { useEffect, useRef, useState } from "react";
import { SITE } from "../config";

const SEEN_KEY = "dgc-intro-seen";

interface Props {
  onDone: () => void;
}

/** Schermo più alto che largo: il video verticale 9:16 riempie il telefono. */
export function isPortraitScreen(): boolean {
  return window.matchMedia("(orientation: portrait)").matches;
}

/** Sceglie il file in base all'orientamento. In orizzontale resta il 16:9. */
export function pickIntroVideo(portrait: boolean): string {
  return portrait && SITE.introVideoPortrait ? SITE.introVideoPortrait : SITE.introVideo;
}

/**
 * Video di apertura a schermo intero.
 * - parte in automatico (muto, perché i browser bloccano l'audio automatico)
 * - si può attivare l'audio o saltare
 * - in verticale usa intro-9x16.mp4, in orizzontale intro.mp4
 * - se il file verticale manca, riprova con quello orizzontale
 * - se manca anche quello, o è già stato visto in questa sessione, viene saltato
 */
export default function IntroVideo({ onDone }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const fellBack = useRef(false);
  const [muted, setMuted] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [src, setSrc] = useState(() => pickIntroVideo(isPortraitScreen()));

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    sessionStorage.setItem(SEEN_KEY, "1");
    window.setTimeout(onDone, 600);
  };

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.load();
    v.play().catch(() => setNeedsTap(true));
  }, [src]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleError = () => {
    if (!fellBack.current && src !== SITE.introVideo) {
      fellBack.current = true;
      setSrc(SITE.introVideo);
      return;
    }
    finish();
  };

  return (
    <div className={`intro ${leaving ? "intro--leaving" : ""}`} role="dialog" aria-label="Video di apertura">
      <video
        ref={ref}
        className="intro__video"
        src={src}
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={handleError}
      />
      <div className="intro__vignette" />

      {needsTap && (
        <button className="btn btn--primary intro__play" onClick={() => ref.current?.play().then(() => setNeedsTap(false))}>
          ▶ Avvia
        </button>
      )}

      <div className="intro__controls">
        <button className="btn btn--ghost" onClick={toggleSound}>
          {muted ? "🔇 Attiva audio" : "🔊 Disattiva audio"}
        </button>
        <button className="btn btn--ghost" onClick={finish}>
          Salta ▸
        </button>
      </div>
    </div>
  );
}

export const introAlreadySeen = () => sessionStorage.getItem(SEEN_KEY) === "1";
