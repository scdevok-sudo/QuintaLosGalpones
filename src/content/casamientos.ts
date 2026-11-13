import type { Cta, Meta } from "./types";

export const meta: Meta = {
  path: "/casamientos/",
  title: "Casamientos en Benavídez | Quinta Los Galpones",
  description:
    "Ceremonia, parque, espacio cubierto y propuestas para tu casamiento en Benavídez. Consultá por el armado, los servicios y el plan de lluvia.",
};

export const hero = {
  h1: "Tu casamiento en Los Galpones",
  body: "Imaginá a tus invitados llegando por el parque, una ceremonia entre árboles y una fiesta que sigue en el espacio cubierto. En Quinta Los Galpones podemos pensar esos momentos con vos, según la fecha, el número de invitados y la celebración que querés hacer.",
  cta: { label: "Consultar por mi fecha", to: "#propuesta" } satisfies Cta,
};

export const sections = {
  ceremonia: {
    h2: "Una ceremonia en la quinta",
    body: "Contamos con un espacio para ceremonias. Al recorrerlo vas a poder conversar sobre el armado, la circulación de invitados y cómo se enlaza con la recepción y la fiesta. Si querés hacer todo en el mismo lugar, incluilo en tu consulta para que la propuesta lo contemple.",
  },
  parque: {
    h2: "El parque y los galpones",
    body: "El predio tiene 6.000 m² al aire libre y un espacio cubierto de 320 m², ampliable a 520 m². El parque aporta verde y aire; el interior permite dar continuidad a la celebración. Te mostraremos qué distribución es viable para tus invitados, con mesas, pista y los demás momentos que quieras incluir.",
  },
  servicios: {
    h2: "Una propuesta con los servicios claros",
    body: "Hay opciones de servicio integral, catering exclusivo, mobiliario y equipamiento propio de sonido e iluminación. Al pedir presupuesto vas a recibir el detalle de lo incluido, las opciones disponibles y los adicionales. Así podés comparar propuestas con el mismo alcance.",
  },
  lluvia: {
    id: "lluvia",
    h2: "Si el pronóstico anuncia lluvia",
    body: "No hace falta dejar esa conversación para la semana del casamiento. Antes de contratar, te explicamos dónde se haría cada momento si llueve y qué capacidad permite el armado cubierto para tu cantidad de invitados. El plan se define según tu evento y queda contemplado en la propuesta.",
    cta: { label: "Consultá el plan de lluvia para tu casamiento", whatsapp: "casamiento-lluvia" } satisfies Cta,
  },
  propuesta: {
    id: "propuesta",
    h2: "Cómo pedir una propuesta",
    body: "Mandanos las fechas posibles, la cantidad estimada de invitados y los nombres de la pareja. Contanos si querés hacer la ceremonia en la quinta y qué servicios te interesan. Con esa información podemos enviarte una propuesta y coordinar una visita.",
    cta: { label: "Pedir presupuesto por WhatsApp", whatsapp: "casamiento" } satisfies Cta,
  },
};
