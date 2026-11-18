import type { Cta, Meta } from "./types";

export const meta: Meta = {
  path: "/espacios",
  og: "espacios",
  title: "Parque y espacios para eventos en Benavídez | Los Galpones",
  description:
    "Recorré el parque de 6.000 m², el espacio cubierto y el sector para ceremonias de Quinta Los Galpones. Conocé las opciones de armado.",
};

export const hero = {
  h1: "Conocé los espacios de Los Galpones",
  body: "No alcanza con mirar una foto del lugar vacío. Para elegir una quinta, necesitás imaginar dónde se recibirán los invitados, cómo se moverán y qué espacio ocupará cada momento. Vení a recorrer Los Galpones con esas preguntas.",
};

export const sections = {
  parque: {
    h2: "El parque",
    // Nota interna omitida: las fotos de esta sección deben mostrar gente y montajes reales.
    body: "Los 6.000 m² al aire libre y la arboleda son parte central de la experiencia. Según el evento, el parque puede acompañar la ceremonia, la recepción o actividades durante el día.",
  },
  cubierto: {
    h2: "El espacio cubierto",
    body: "Son 320 m² cubiertos, ampliables a 520 m². El lugar cuenta con ventilación y calefacción. El armado posible depende de las mesas, la pista y los demás sectores que necesites. Pedinos la capacidad para tu formato y las condiciones de ampliación.",
  },
  ceremonia: {
    h2: "La ceremonia",
    body: "La quinta cuenta con un espacio para ceremonias. En una visita podés verlo, consultar cómo se arma y conocer la alternativa contemplada ante lluvia.",
  },
  llegada: {
    h2: "Llegada y servicios",
    body: "Estamos a 500 metros de Panamericana, con acceso por calle asfaltada y estacionamiento dentro del predio. Los Galpones dispone de mobiliario, sonido e iluminación propios. El detalle de uso e inclusión de cada servicio se presenta en la propuesta.",
    cta: { label: "Agendar una visita", to: "/contacto#visita" } satisfies Cta,
  },
};
