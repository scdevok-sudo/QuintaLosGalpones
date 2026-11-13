import type { Cta, Meta } from "./types";

export const meta: Meta = {
  path: "/eventos-empresariales/",
  title: "Eventos de empresa en Benavídez | Quinta Los Galpones",
  description:
    "Organizá una celebración o encuentro de equipo en una quinta de Benavídez con parque, espacio cubierto y estacionamiento. Pedí una propuesta.",
};

export const hero = {
  h1: "Eventos de empresa con espacio para salir de la rutina",
  body: "Un buen encuentro necesita un lugar que acompañe lo que la empresa quiere hacer. En Los Galpones tenés parque, un espacio cubierto amplio y acceso a 500 metros de Panamericana. Contanos el objetivo de la jornada y trabajamos una propuesta acorde.",
  cta: { label: "Consultar por un evento de empresa", to: "#propuesta" } satisfies Cta,
};

export const sections = {
  encuentro: {
    h2: "Qué tipo de encuentro imaginás",
    body: "Podemos conversar sobre una celebración de fin de año, una reunión de equipos o una jornada con actividades. La propuesta se construye a partir de la cantidad de asistentes, el horario, el programa y los servicios que necesitás. Si hay presentaciones o dinámicas específicas, describilas desde el inicio para revisar su viabilidad.",
  },
  espacios: {
    h2: "Un lugar para distintos momentos",
    body: "El parque de 6.000 m² permite pensar actividades y encuentros al aire libre. El espacio cubierto tiene 320 m² y puede ampliarse a 520 m². Su uso y distribución dependen del formato elegido. En la visita podemos recorrer los sectores con quienes van a producir la jornada.",
  },
  servicios: {
    h2: "Operación y servicios",
    body: "La quinta cuenta con estacionamiento interno, mobiliario y equipamiento propio de sonido e iluminación. El catering es exclusivo. Enviá una lista de necesidades técnicas y gastronómicas para que la propuesta indique qué está incluido y qué requiere una cotización adicional.",
  },
  lluvia: {
    h2: "La alternativa por lluvia también forma parte del proyecto",
    body: "Si la jornada incluye actividades exteriores, definimos de antemano cuáles pueden pasar al sector cubierto y cuáles necesitan otra solución. La capacidad y el armado se revisan para cada programa antes de cerrar la propuesta.",
  },
  propuesta: {
    id: "propuesta",
    h2: "Contanos lo esencial",
    body: "Empresa, persona de contacto, fecha o rango de fechas, cantidad estimada de asistentes, objetivo del encuentro y horario. Si ya tenés una agenda o proveedores involucrados, sumalos a la consulta.",
    cta: { label: "Pedir una propuesta para mi empresa", to: "/contacto/?tipo=empresa#formulario" } satisfies Cta,
  },
};
