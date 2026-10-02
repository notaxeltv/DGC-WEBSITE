import { useEffect, useRef, useState } from "react";
import { SITE } from "../config";

const SEEN_KEY = "dgc-intro-seen";

interface Props {
  onDone: () => void;
}

/**
 * Video di apertura a schermo intero.
 * - parte in automatico (muto, perché i browser bloccano l'audio automatico)
 * - si può attivare l'audio o saltare
 * - se il file non esiste ancora, o è già stato visto in questa sessione, viene saltato
 */
export default function IntroVideo({ onDone }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    sessionStorage.setItem(SEEN_KEY, "1");
    window.setTimeout(onDone, 600);
  };

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => setNeedsTap(true));
  }, []);

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

  return (
    <div className={`intro ${leaving ? "intro--leaving" : ""}`} role="dialog" aria-label="Video di apertura">
      <video
        ref={ref}
        className="intro__video"
        src={SITE.introVideo}
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
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
