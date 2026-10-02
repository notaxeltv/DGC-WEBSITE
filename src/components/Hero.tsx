import { useEffect, useRef, useState } from "react";
import { HAS_CONTACTS, SITE } from "../config";

interface Props {
  totalCards: number;
  totalCopies: number;
}

export default function Hero({ totalCards, totalCopies }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stillRef = useRef<HTMLCanvasElement>(null);
  const [frozen, setFrozen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || failed) return;
    const onEnd = () => {
      const still = stillRef.current;
      if (still && v.videoWidth) {
        still.width = v.videoWidth;
        still.height = v.videoHeight;
        still.getContext("2d")?.drawImage(v, 0, 0, still.width, still.height);
      }
      setFrozen(true);
    };
    v.addEventListener("ended", onEnd);
    return () => v.removeEventListener("ended", onEnd);
  }, [failed, frozen]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || frozen || failed) return;

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
  }, [frozen, failed]);

  const replay = () => {
    setNeedsTap(false);
    setFrozen(false);
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
        <div className={`hero__media ${failed ? "hero__media--logo" : ""}`}>
          {failed ? (
            <img src="/logo.png" alt={SITE.name} width={800} height={800} className="hero__logo" />
          ) : (
            <>
              <video
                ref={videoRef}
                className={`hero__video ${frozen ? "hero__video--hidden" : ""}`}
                src={SITE.introVideo}
                muted={muted}
                playsInline
                preload="auto"
                aria-label="Video di Dark Ghost Cards"
                onError={() => setFailed(true)}
              />
              <canvas
                ref={stillRef}
                className={`hero__still ${frozen ? "" : "hero__still--hidden"}`}
                aria-hidden={!frozen}
              />
            </>
          )}

          {!frozen && !failed && (
            <div className="hero__video-controls">
              {needsTap && (
                <button type="button" className="btn btn--primary" onClick={playNow}>
                  ▶ Avvia
                </button>
              )}
              <button type="button" className="btn btn--ghost" onClick={toggleSound}>
                {muted ? "🔇 Audio" : "🔊 Audio"}
              </button>
            </div>
          )}
        </div>

        {frozen && (
          <button type="button" className="btn btn--ghost hero__replay" onClick={replay}>
            ▶ Rivedi il video
          </button>
        )}

        <p className="hero__ship">Bustina e toploader, spedizione tracciata.</p>
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
