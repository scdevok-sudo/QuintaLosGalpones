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
