import { realesVisible } from "./reales";
import type { Meta } from "./types";

const allNav = [
  { label: "Inicio", to: "/" },
  { label: "Casamientos", to: "/casamientos" },
  { label: "Eventos de empresa", to: "/eventos-empresariales" },
  { label: "Espacios", to: "/espacios" },
  { label: "Eventos reales", to: "/eventos-reales" },
  { label: "Preguntas frecuentes", to: "/preguntas-frecuentes" },
  { label: "Contacto", to: "/contacto" },
] as const;

/** Eventos reales se oculta del menú y del pie con `realesVisible = false` (reales.ts). */
export const nav = allNav.filter((i) => i.to !== "/eventos-reales" || realesVisible);

/** Acción destacada del menú: va a #visita y, en Contacto, también ofrece WhatsApp de visita. */
export const navAction = { label: "Coordinar una visita", to: "/contacto#visita" } as const;

export const footer = {
  name: "Quinta Los Galpones",
  line: "Casamientos y eventos de empresa en Benavídez",
  address: "Quintino Bocayuva 655",
  instagramLabel: "Instagram @quintalosgalpones",
  contactLabel: "Contacto",
  privacyLabel: "Política de privacidad",
};

export const notFoundMeta: Meta = {
  path: "/404",
  title: "Página no encontrada | Quinta Los Galpones",
  description: "No encontramos esta página. Volvé al inicio o recorré las secciones principales de Quinta Los Galpones.",
};
