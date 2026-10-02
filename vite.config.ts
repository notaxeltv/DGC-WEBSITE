import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Aggiunge i tag per l'anteprima di condivisione (WhatsApp, Instagram, Facebook...).
 * Servono indirizzi assoluti, quindi il dominio viene preso da:
 *  1) VITE_SITE_URL (se hai un dominio tuo, es. https://darkghostcards.it)
 *  2) VERCEL_PROJECT_PRODUCTION_URL (impostata da Vercel in automatico)
 * Se nessuno dei due è disponibile (es. in locale) i tag con indirizzo vengono omessi.
 */
function socialPreview(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/$/, "");
  return {
    name: "social-preview",
    transformIndexHtml() {
      if (!base) return [];
      return [
        { tag: "link", attrs: { rel: "canonical", href: `${base}/` }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:url", content: `${base}/` }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:image", content: `${base}/og-image.jpg` }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" }, injectTo: "head" },
        { tag: "meta", attrs: { name: "twitter:image", content: `${base}/og-image.jpg` }, injectTo: "head" },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const siteUrl = env.VITE_SITE_URL || (vercel ? `https://${vercel}` : "");

  return {
    plugins: [react(), socialPreview(siteUrl)],
  };
});
