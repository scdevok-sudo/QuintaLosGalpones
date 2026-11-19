import type { Cta } from "./types";
import type { SlotName } from "./photos";

/**
 * Recorrido "Un día en Los Galpones". Los textos son frases del documento, sin reescribir.
 * `tema` define la superficie del panel: día (tarde) o noche.
 */
export const heading = "Un día en Los Galpones";

export type Scene = {
  id: "llegada" | "ceremonia" | "fiesta" | "noche";
  nombre: string;
  tema: "dia" | "noche";
  /** Lado de escritorio de la tarjeta de texto sobre la foto: izquierda por defecto; derecha si taparía el sujeto (check:story). */
  panel?: "left" | "right";
  slot: SlotName;
  texto: string;
  cta: Cta;
};

export const scenes: Scene[] = [
  {
    id: "llegada",
    nombre: "Llegada",
    tema: "dia",
    slot: "story.llegada",
    texto:
      "Estamos en Benavídez, a 500 metros de Panamericana. Hay acceso por calle asfaltada y estacionamiento dentro del predio.",
    cta: { label: "Conocé los espacios", to: "/espacios" },
  },
  {
    id: "ceremonia",
    nombre: "Ceremonia",
    tema: "dia",
    slot: "story.ceremonia",
    texto:
      "Contamos con un espacio para ceremonias. Al recorrerlo vas a poder conversar sobre el armado, la circulación de invitados y cómo se enlaza con la recepción y la fiesta.",
    cta: { label: "Quiero organizar mi casamiento", to: "/casamientos" },
  },
  {
    id: "fiesta",
    nombre: "Fiesta",
    tema: "noche",
    slot: "story.fiesta",
    texto:
      "El parque aporta verde y aire; el interior permite dar continuidad a la celebración. Son 320 m² cubiertos, ampliables a 520 m².",
    cta: { label: "Conocé los espacios", to: "/espacios" },
  },
  {
    id: "noche",
    nombre: "Noche",
    tema: "noche",
    slot: "story.noche",
    texto: "Los Galpones dispone de mobiliario, sonido e iluminación propios.",
    cta: { label: "Coordinar una visita", to: "/contacto#visita" },
  },
];
