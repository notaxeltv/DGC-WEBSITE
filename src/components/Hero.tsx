import { useEffect, useRef, useState } from "react";
import { HAS_CONTACTS, SITE } from "../config";
import { isPortraitScreen, pickIntroVideo } from "../lib/introVideo";

interface Props {
  totalCards: number;
  totalCopies: number;
}

export default function Hero({ totalCards, totalCopies }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fellBack = useRef(false);
  const [src, setSrc] = useState(() => pickIntroVideo(isPortraitScreen()));
  const [showLogo, setShowLogo] = useState(false);
  const [muted, setMuted] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnd = () => setShowLogo(true);
    v.addEventListener("ended", onEnd);
    return () => v.removeEventListener("ended", onEnd);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (showLogo) {
      v.pause();
      return;
    }

    const play = () => {
      v.play().catch(() => setNeedsTap(true));
    };
    const onReady = () => {
      try {
        v.currentTime = 0;
      } catch {
        /* il browser non ha ancora la durata */
      }
      play();
    };

    if (v.readyState >= 2) onReady();
    else {
      v.addEventListener("loadeddata", onReady, { once: true });
      v.load();
    }
    return () => v.removeEventListener("loadeddata", onReady);
  }, [showLogo, src]);

  const replay = () => {
    fellBack.current = false;
    setNeedsTap(false);
    setSrc(pickIntroVideo(isPortraitScreen()));
    setShowLogo(false);
  };

  const handleError = () => {
    if (!fellBack.current && src !== SITE.introVideo) {
      fellBack.current = true;
      setSrc(SITE.introVideo);
      return;
    }
    setShowLogo(true);
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => setNeedsTap(true));
  };

  const playNow = () => {
    videoRef.current?.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true));
  };

  return (
    <section className="hero" id="top">
      <div className="hero__smoke" aria-hidden />
      <div className="hero__inner">
        <div className="hero__stage">
          <img
            src="/logo.png"
            alt={showLogo ? SITE.name : ""}
            width={800}
            height={800}
            aria-hidden={!showLogo}
            className={`hero__logo ${showLogo ? "" : "hero__logo--hidden"}`}
          />
          <video
            ref={videoRef}
            className={`hero__video ${showLogo ? "hero__video--hidden" : ""}`}
            src={src}
            muted={muted}
            playsInline
            preload="auto"
            aria-label="Video di apertura"
            onEnded={() => setShowLogo(true)}
            onError={handleError}
          />

          {!showLogo && (
            <div className="hero__video-controls">
              {needsTap && (
                <button type="button" className="btn btn--primary" onClick={playNow}>
                  ▶ Avvia
                </button>
              )}
              <button type="button" className="btn btn--ghost" onClick={toggleSound}>
                {muted ? "🔇 Attiva audio" : "🔊 Disattiva audio"}
              </button>
            </div>
          )}
        </div>

        {showLogo && (
          <button type="button" className="btn btn--ghost hero__replay" onClick={replay}>
            ▶ Rivedi il video
          </button>
        )}

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
