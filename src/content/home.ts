import type { Cta, Meta } from "./types";

export const meta: Meta = {
  path: "/",
  title: "Quinta Los Galpones | Casamientos y eventos en Benavídez",
  // Errata corregida: "6.000 m², y propuestas" -> "6.000 m² y propuestas".
  description:
    "Un parque de 6.000 m² y propuestas para casamientos y eventos de empresa en Benavídez. Conocé los espacios y coordiná una visita.",
};

export const hero = {
  h1: "Casamientos y eventos en una quinta de Benavídez",
  /** El mismo H1 partido en líneas para la entrada línea por línea. Unidas dan exactamente `h1`. */
  h1Lines: ["Casamientos", "y eventos en", "una quinta", "de Benavídez"],
  body: "En Los Galpones, el parque, la arboleda y el espacio cubierto permiten imaginar una ceremonia al aire libre, una fiesta alrededor de la mesa o una jornada de equipo fuera de la oficina. Estamos en Benavídez, a 500 metros de Panamericana.",
  /** Abre la consulta express; sin JS enlaza a /contacto/#formulario. */
  cta: { label: "Vení a conocer la quinta", to: "/contacto/#formulario" } satisfies Cta,
  secondary: { label: "Contanos qué evento querés organizar", to: "/contacto/#formulario" } satisfies Cta,
  datos: "6.000 m² de parque, 320 m² cubiertos y a 500 metros de Panamericana.",
};

export const lugar = {
  h2: "Un lugar con espacio para vivir cada momento",
  body: "La quinta tiene 6.000 m² de parque y 320 m² cubiertos, con posibilidad de ampliar el sector cubierto a 520 m². Cada evento pide un recorrido distinto. Durante la visita podemos mostrarte cómo se usan los espacios y pensar un armado para la cantidad de personas que esperás.",
  cta: { label: "Conocé los espacios", to: "/espacios/" } satisfies Cta,
  /** Ficha de datos de decisión rápida. Solo datos que ya están en el copy. */
  ficha: [
    { term: "Parque", def: "6.000 m² al aire libre y arboleda." },
    { term: "Espacio cubierto", def: "320 m², con posibilidad de ampliar a 520 m². Ventilación y calefacción." },
    { term: "Ceremonia", def: "Contamos con un espacio para ceremonias." },
    {
      term: "Servicios",
      def: "Hay opciones de servicio integral, catering exclusivo, mobiliario y equipamiento propio de sonido e iluminación.",
    },
    { term: "Estacionamiento", def: "Dentro del predio." },
    { term: "Llegada", def: "A 500 metros de Panamericana, con acceso por calle asfaltada." },
  ],
};

/** Bloque de visita de la segunda pantalla (anexo v2.3). Frases del copy: dirección, acceso y estacionamiento. */
export const visitaRapida = {
  h2: "Coordiná una visita",
  body: "Quintino Bocayuva 655, Benavídez. A 500 metros de Panamericana, con acceso por calle asfaltada y estacionamiento dentro del predio.",
  cta: { label: "Coordinar una visita", whatsapp: "visita" } satisfies Cta,
};

export const casamientos = {
  h2: "Casamientos",
  body: "Si querés celebrar en contacto con la naturaleza, Los Galpones ofrece un espacio para la ceremonia, parque y un ambiente cubierto para la fiesta. Contanos cómo imaginás el día y te explicamos las opciones de servicio, el armado posible y la alternativa prevista si llueve.",
  cta: { label: "Quiero organizar mi casamiento", to: "/casamientos/" } satisfies Cta,
};

export const empresas = {
  h2: "Eventos de empresa",
  body: "Una celebración, una reunión de equipo o un encuentro con actividades pueden cambiar de ritmo cuando salen de la oficina. Decinos qué necesita tu empresa, cuántas personas asistirían y qué fecha tenés en mente. Evaluamos juntos el formato, los espacios y los servicios necesarios.",
  cta: { label: "Consultar por un evento de empresa", to: "/eventos-empresariales/" } satisfies Cta,
};

export const lluvia = {
  h2: "¿Y si llueve?",
  body: "La lluvia forma parte de las preguntas que conviene resolver antes de reservar. Los Galpones cuenta con espacio cubierto y un plan de lluvia. El armado concreto depende del tipo de evento y de la cantidad de invitados: te mostramos la alternativa prevista para tu fecha antes de que tomes una decisión.",
  cta: { label: "Ver cómo pensamos el plan de lluvia", to: "/casamientos/#lluvia" } satisfies Cta,
  /** Interruptor Sol / Lluvia: etiquetas y pies de foto (texto nuestro, ver COPY-CAMBIOS.md). */
  toggle: {
    label: "Ver el lugar con",
    sol: { name: "Sol", caption: "El parque a pleno sol." },
    lluvia: { name: "Lluvia", caption: "El armado cubierto." },
  },
};

export const testimonios = {
  h2: "Lo que cuentan quienes celebraron acá",
  /** `approved` queda en false hasta confirmar autorización de nombre e imagen. */
  items: [
    { quote: "Iván estuvo siempre atento, hizo una decoración hermosa", cite: "Daiana V.", approved: false },
    {
      quote: "Iván súper dispuesto a todo, el catering increíble y el servicio durante toda la noche",
      cite: "Antonella R.",
      approved: false,
    },
  ],
};

/** Secuencia real de 3 pasos. Las frases salen del copy existente. */
export const seguimos = {
  h2: "Cómo seguimos",
  pasos: [
    {
      titulo: "Contanos tu evento",
      texto: "Con la fecha posible, la cantidad aproximada de personas y una idea del evento podemos empezar a conversar.",
    },
    { titulo: "Visitás la quinta", texto: "Vas a poder ver el parque, el espacio cubierto y los posibles armados." },
    {
      titulo: "Recibís la propuesta por escrito",
      texto: "Te enviamos por escrito qué incluye tu presupuesto y qué se cotiza aparte.",
    },
  ],
};

export const visita = {
  h2: "Vení a verlo con tu evento en mente",
  body: "Estamos en Quintino Bocayuva 655, Benavídez. Hay acceso por calle asfaltada y estacionamiento dentro del predio. Coordiná una visita para recorrer el parque, el espacio cubierto y los sectores que más importan para tu evento.",
  cta: { label: "Consultar por mi fecha", to: "/contacto/#formulario" } satisfies Cta,
  ctaVisita: { label: "Coordinar una visita", to: "/contacto/#visita" } satisfies Cta,
};
