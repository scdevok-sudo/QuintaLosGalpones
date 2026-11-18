/**
 * Datos del sitio. Todo dato que el cliente todavía no confirmó lleva
 * `validated: false`: no se muestra y entra en `npm run check:launch`.
 */
export type Datum<T> = { value: T; validated: boolean };

export const env = {
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://quintalosgalpones.com",
  noindex: (import.meta.env.VITE_NOINDEX as string | undefined) !== "false",
  formEndpoint: (import.meta.env.VITE_FORM_ENDPOINT as string | undefined) ?? "",
  gaId: (import.meta.env.VITE_GA_ID as string | undefined) ?? "",
  /** Preview: muestra piezas que esperan foto real (ej. interruptor de lluvia) con la provisoria. */
  previewPending: (import.meta.env.VITE_PREVIEW_PENDING as string | undefined) === "true",
};

/** Contacto ya existe. Si se desactiva, los CTA a /contacto usan la consulta express (#consulta) o WhatsApp. */
export const contactoReady = true;

export const site = {
  name: "Quinta Los Galpones",
  tagline: "Casamientos y eventos de empresa en Benavídez",
  street: "Quintino Bocayuva 655",
  locality: "Benavídez",
  region: "provincia de Buenos Aires",
  country: "AR",
  instagram: "https://www.instagram.com/quintalosgalpones/",
  instagramHandle: "@quintalosgalpones",
  /** WhatsApp en formato internacional sin signos. Titular pendiente de confirmar. */
  whatsapp: { value: "5491152498834", display: "11 5249-8834", validated: false } as Datum<string> & { display: string },
  email: { value: "", validated: false } as Datum<string>,
  mapsUrl: { value: "", validated: false } as Datum<string>,
  coordinates: { value: null as null | { lat: number; lng: number }, validated: false },
  /** Revisión legal de la política de privacidad. Mientras sea false, la página muestra el aviso de borrador. */
  privacyReviewed: { value: false, validated: false } as Datum<boolean>,
  analyticsId: { value: env.gaId, validated: Boolean(env.gaId) } as Datum<string>,
};

/**
 * El enlace de WhatsApp se genera igual aunque el número no esté validado,
 * para poder probar el flujo en preview. `check:launch` avisa que falta validar.
 */
export const whatsappAvailable = true;
