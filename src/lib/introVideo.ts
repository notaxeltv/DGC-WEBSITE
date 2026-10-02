import { SITE } from "../config";

/** Schermo più alto che largo: il video verticale 9:16 riempie il telefono. */
export function isPortraitScreen(): boolean {
  return window.matchMedia("(orientation: portrait)").matches;
}

/** Sceglie il file in base all'orientamento. In orizzontale resta il 16:9. */
export function pickIntroVideo(portrait: boolean): string {
  return portrait && SITE.introVideoPortrait ? SITE.introVideoPortrait : SITE.introVideo;
}
