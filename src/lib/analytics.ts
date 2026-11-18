import { env } from "@/config/site";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Envía un evento a GA4 si está cargado. Si no hay VITE_GA_ID, no hace nada. */
export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

let started = false;

/**
 * Carga gtag.js solo si existe VITE_GA_ID. No bloquea el render y no hace ningún pedido antes del LCP:
 * espera al evento `load` y a un momento ocioso. Sin cookies de publicidad: no se activan señales ni personalización.
 * Se llama una vez al hidratar (root.tsx).
 */
export function startAnalytics() {
  const id = env.gaId;
  if (!id || started || typeof window === "undefined") return;
  started = true;
  const boot = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // gtag exige `arguments`, no un arreglo.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", id, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
  };
  const idle = () => ((window as Window & { requestIdleCallback?: (f: () => void, o?: object) => void }).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1500)))(boot, { timeout: 4000 });
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}
