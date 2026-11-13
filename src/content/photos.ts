/**
 * Sistema de slots de fotos.
 *
 * Cada slot describe una foto del sitio: archivo, alt, punto focal y relación de aspecto
 * para desktop y mobile. `temp: true` marca imágenes provisorias bajadas del sitio actual
 * (son del cliente). En la Fase 2 se reemplazan por las finales sin tocar los componentes.
 */
export type Slot = {
  /** Ruta pública de la imagen. */
  src: string;
  /** Texto alternativo descriptivo, en español rioplatense. */
  alt: string;
  /** Punto focal en % (0 a 100), usado como object-position. */
  focal: { x: number; y: number };
  /** Relación de aspecto [ancho, alto]. Reserva el espacio para evitar saltos de layout. */
  ratio: { desktop: [number, number]; mobile: [number, number] };
  /** Dimensiones intrínsecas de la imagen. */
  width: number;
  height: number;
  /** Imagen provisoria. check:launch avisa mientras haya alguna. */
  temp: boolean;
  /** Para fotos de personas o eventos reales: autorización de quienes aparecen. */
  approved?: boolean;
  eventType?: "casamientos" | "empresa" | "clima";
  /** La foto provisoria no muestra lo que el slot necesita (ej. armado cubierto con lluvia real). */
  pending?: boolean;
};

type Raw = {
  file: string;
  w: number;
  h: number;
  alt: string;
  focal?: [number, number];
  desktop?: [number, number];
  mobile?: [number, number];
  eventType?: Slot["eventType"];
  approved?: boolean;
  pending?: boolean;
};

const make = (r: Raw): Slot => ({
  src: `/photos-temp/${r.file}.webp`,
  alt: r.alt,
  focal: { x: r.focal?.[0] ?? 50, y: r.focal?.[1] ?? 50 },
  ratio: { desktop: r.desktop ?? [3, 2], mobile: r.mobile ?? [4, 5] },
  width: r.w,
  height: r.h,
  temp: true,
  approved: r.approved ?? false,
  eventType: r.eventType,
  pending: r.pending,
});

// Catálogo de provisorias (sitio actual). p01..p14.
const P = {
  p01: { file: "p01", w: 1024, h: 461, alt: "Invitados caminando por el césped del parque al atardecer, con la arboleda y los bancos de madera al fondo" },
  p02: { file: "p02", w: 1024, h: 461, alt: "Rincón del parque con living de pallets y almohadones blancos bajo un árbol grande con luces colgantes" },
  p03: { file: "p03", w: 1024, h: 682, alt: "Ceremonia de casamiento al aire libre entre árboles, con antorchas y flores blancas junto al arco" },
  p04: { file: "p04", w: 1024, h: 684, alt: "Tres chicos con coronas de flores tomados de la mano en el parque" },
  p05: { file: "p05", w: 1024, h: 685, alt: "Invitados reunidos en el parque junto a un sector de living al aire libre, entre los árboles" },
  p06: { file: "p06", w: 1024, h: 676, alt: "Grupo de invitados sentados en el césped y en troncos durante un casamiento, bajo el sol" },
  p07: { file: "p07", w: 1024, h: 683, alt: "Barra de madera con copas de cristal y un arreglo de flores blancas" },
  p08: { file: "p08", w: 1024, h: 683, alt: "Frasco con flores blancas y ramas verdes sobre una mesa de madera junto a almohadones" },
  p09: { file: "p09", w: 1024, h: 683, alt: "Novia y su papá caminando por el césped hacia la ceremonia, con guirnaldas de luces atrás" },
  p10: { file: "p10", w: 1024, h: 683, alt: "Invitados sonriendo durante la ceremonia, con una nena en brazos de su abuelo" },
  p11: { file: "p11", w: 1024, h: 683, alt: "Ramo de novia sobre un tronco de madera junto a velas encendidas" },
  p12: { file: "p12", w: 1024, h: 683, alt: "Decoración nocturna con velas, faroles y flores sobre cajones de madera" },
  p13: { file: "p13", w: 1024, h: 683, alt: "Invitados conversando en livings de pallets bajo una pérgola con vegetación" },
  p14: { file: "p14", w: 1024, h: 792, alt: "Amigos riendo y abrazados en plena fiesta de casamiento" },
} satisfies Record<string, Omit<Raw, "focal">>;

export const slots = {
  // Hero (v2): foto principal con máscara de galpón y foto secundaria, plano más cerrado.
  "hero.principal": make({ ...P.p09, focal: [42, 52], desktop: [5, 4], mobile: [4, 3] }),
  "hero.secundaria": make({ ...P.p10, focal: [50, 40], desktop: [4, 3], mobile: [4, 3] }),

  // Recorrido "Un día en Los Galpones" (v2)
  "story.llegada": make({ ...P.p01, focal: [55, 55], desktop: [16, 9], mobile: [4, 3] }),
  "story.ceremonia": make({ ...P.p03, focal: [50, 50], desktop: [16, 9], mobile: [4, 3], eventType: "casamientos" }),
  "story.fiesta": make({ ...P.p13, focal: [50, 45], desktop: [16, 9], mobile: [4, 3] }),
  "story.noche": make({ ...P.p12, focal: [50, 55], desktop: [16, 9], mobile: [4, 3] }),

  // "¿Y si llueve?": sol y armado cubierto. No hay foto real de armado cubierto con lluvia.
  "lluvia.sol": make({ ...P.p06, focal: [50, 55], desktop: [4, 3], mobile: [4, 3] }),
  "lluvia.cubierto": make({ ...P.p13, focal: [50, 50], desktop: [4, 3], mobile: [4, 3], pending: true }),

  // Inicio
  "home.hero": make({ ...P.p01, focal: [55, 60], desktop: [21, 9], mobile: [4, 5] }),
  "home.espacios": make({ ...P.p06, focal: [50, 55], desktop: [3, 2], mobile: [4, 3] }),
  "home.casamientos": make({ ...P.p03, focal: [50, 55], desktop: [5, 4], mobile: [4, 3], eventType: "casamientos" }),
  "home.empresas": make({ ...P.p05, focal: [45, 62], desktop: [16, 10], mobile: [3, 2] }),
  "home.lluvia": make({ ...P.p13, focal: [50, 45], desktop: [3, 2], mobile: [4, 3] }),
  "home.visita": make({ ...P.p02, focal: [50, 55], desktop: [3, 2], mobile: [4, 3] }),

  // Casamientos
  "casamientos.hero": make({ ...P.p09, focal: [40, 55], desktop: [21, 9], mobile: [4, 5], eventType: "casamientos" }),
  "casamientos.ceremonia": make({ ...P.p03, focal: [50, 55], eventType: "casamientos" }),
  "casamientos.parque": make({ ...P.p06, focal: [50, 55] }),
  "casamientos.interior": make({ ...P.p13, focal: [50, 50] }),
  "casamientos.servicios": make({ ...P.p07, focal: [50, 50] }),
  "casamientos.lluvia": make({ ...P.p13, focal: [40, 50] }),

  // Eventos de empresa
  "empresas.hero": make({ ...P.p05, focal: [45, 60], desktop: [21, 9], mobile: [4, 5] }),
  "empresas.encuentro": make({ ...P.p06, focal: [50, 55] }),
  "empresas.espacios": make({ ...P.p01, focal: [50, 60], desktop: [3, 2], mobile: [4, 3] }),
  "empresas.servicios": make({ ...P.p07, focal: [50, 50] }),

  // Espacios
  "espacios.hero": make({ ...P.p01, focal: [55, 60], desktop: [21, 9], mobile: [4, 5] }),
  "espacios.parque": make({ ...P.p02, focal: [50, 55] }),
  "espacios.cubierto": make({ ...P.p13, focal: [50, 50] }),
  "espacios.ceremonia": make({ ...P.p03, focal: [50, 55] }),
  "espacios.llegada": make({ ...P.p05, focal: [50, 60] }),
  "espacios.banos": make({ ...P.p08, focal: [50, 50] }),

  // Contacto
  "contacto.hero": make({ ...P.p02, focal: [50, 55], desktop: [21, 9], mobile: [4, 5] }),
  "contacto.entrada": make({ ...P.p01, focal: [50, 60], desktop: [3, 2], mobile: [4, 3] }),

  // Social
  "og.default": make({ ...P.p01, focal: [55, 60], desktop: [1200, 630], mobile: [1200, 630] }),
  equipo: make({ ...P.p10, focal: [50, 45], desktop: [3, 2], mobile: [4, 3] }),

  // Eventos reales: galería (cada una con tipo de evento)
  "reales.1": make({ ...P.p09, focal: [40, 55], eventType: "casamientos" }),
  "reales.2": make({ ...P.p03, focal: [50, 55], eventType: "casamientos" }),
  "reales.3": make({ ...P.p10, focal: [50, 45], eventType: "casamientos" }),
  "reales.4": make({ ...P.p04, focal: [50, 40], eventType: "casamientos" }),
  "reales.5": make({ ...P.p06, focal: [50, 55], eventType: "casamientos" }),
  "reales.6": make({ ...P.p11, focal: [50, 55], eventType: "casamientos" }),
  "reales.7": make({ ...P.p12, focal: [50, 55], eventType: "casamientos" }),
  "reales.8": make({ ...P.p14, focal: [50, 40], eventType: "casamientos" }),
  "reales.9": make({ ...P.p13, focal: [50, 50], eventType: "clima" }),
} satisfies Record<string, Slot>;

export type SlotName = keyof typeof slots;
