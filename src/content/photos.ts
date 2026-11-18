/**
 * Sistema de slots de fotos.
 *
 * Cada slot describe una foto del sitio: archivo, alt, punto focal y relación de aspecto
 * para desktop y mobile. `temp: true` marca imágenes provisorias bajadas del sitio actual
 * (son del cliente). En la Fase 2 se reemplazan por las finales sin tocar los componentes.
 */
import manifestJson from "@/data/photos.manifest.json";
import slotMapJson from "@/data/photos.slots.json";

type ManifestEntry = {
  id: string;
  nombre: string | null;
  seccion?: string;
  estado: string;
  pendientes: string[];
  alt: string;
  lqip: string | null;
  personas: string;
  anchosGenerados: number[];
  jpeg?: { width: number; height: number };
  mobile?: Record<string, { nombre: string; widths: number[]; maxWidth: number }>;
};
type SlotCfg = { foto: string; desktop: [number, number]; mobile: [number, number]; bleed?: [number, number]; focal?: [number, number]; mobileCrop?: { maxWidth: number } };
const manifest = manifestJson as unknown as ManifestEntry[];
const slotMap = slotMapJson as unknown as Record<string, SlotCfg>;

/** Fuentes responsivas de una foto procesada (photos:build). */
export type Sources = { avif: string };

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
  /** Foto procesada por photos:build: srcset AVIF y WebP (el JPEG va en `src`). */
  sources?: Sources;
  /** Marcador de baja calidad (data URI) para el fondo mientras carga. */
  lqip?: string;
  /** Estado del manifiesto: ok, provisoria-* o bloqueada. */
  estado?: string;
  /** Proporción a sangre (desktop), lista para originales de 2000 px o más. Se activa con VITE_HERO_BLEED. */
  bleed?: [number, number];
  /** Dirección de arte: recorte propio para pantallas angostas (photos:build). Hasta `maxWidth` px se usa esta fuente. */
  mobile?: { avif: string; maxWidth: number };
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

/**
 * Si el slot tiene una foto procesada en photos.config.json, usa el manifiesto; si no, queda la provisoria del sitio actual.
 * Una foto `bloqueada` nunca se usa: vuelve a la provisoria.
 */
const use = (name: string, legacy: Slot): Slot => {
  const c = slotMap[name];
  const e = c && manifest.find((m) => m.id === c.foto && m.seccion !== "og");
  if (!c || !e || !e.nombre || !e.jpeg || e.estado === "bloqueada") return legacy;
  const base = `/photos/${e.nombre}`;
  const mv = c.mobileCrop ? e.mobile?.[name] : undefined;
  const set = (ext: string) => e.anchosGenerados.map((w) => `${base}-w${w}.${ext} ${w}w`).join(", ");
  return {
    src: `${base}-w${e.jpeg.width}.jpg`,
    alt: e.alt,
    focal: { x: c.focal?.[0] ?? 50, y: c.focal?.[1] ?? 50 },
    ratio: { desktop: c.desktop, mobile: c.mobile },
    width: e.jpeg.width,
    height: e.jpeg.height,
    temp: false,
    approved: false,
    eventType: legacy.eventType,
    pending: legacy.pending,
    sources: { avif: set("avif") },
    mobile: mv ? { avif: mv.widths.map((w) => `/photos/${mv.nombre}-w${w}.avif ${w}w`).join(", "), maxWidth: mv.maxWidth } : undefined,
    lqip: e.lqip ?? undefined,
    estado: e.estado,
    bleed: c.bleed,
  };
};

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
  "hero.principal": use("hero.principal", make({ ...P.p09, focal: [42, 52], desktop: [5, 4], mobile: [4, 3] })),
  "hero.secundaria": use("hero.secundaria", make({ ...P.p10, focal: [50, 40], desktop: [4, 3], mobile: [4, 3] })),

  // Recorrido "Un día en Los Galpones" (v2)
  "story.llegada": use("story.llegada", make({ ...P.p01, focal: [55, 55], desktop: [16, 9], mobile: [4, 3] })),
  "story.ceremonia": use("story.ceremonia", make({ ...P.p03, focal: [50, 50], desktop: [16, 9], mobile: [4, 3], eventType: "casamientos" })),
  "story.fiesta": use("story.fiesta", make({ ...P.p13, focal: [50, 45], desktop: [16, 9], mobile: [4, 3] })),
  "story.noche": use("story.noche", make({ ...P.p12, focal: [50, 55], desktop: [16, 9], mobile: [4, 3] })),

  // "¿Y si llueve?": sol y armado cubierto. No hay foto real de armado cubierto con lluvia.
  "lluvia.sol": use("lluvia.sol", make({ ...P.p06, focal: [50, 55], desktop: [4, 3], mobile: [4, 3] })),
  "lluvia.cubierto": use("lluvia.cubierto", make({ ...P.p13, focal: [50, 50], desktop: [4, 3], mobile: [4, 3], pending: true })),

  // Inicio
  "home.hero": use("home.hero", make({ ...P.p01, focal: [55, 60], desktop: [21, 9], mobile: [4, 5] })),
  "home.espacios": use("home.espacios", make({ ...P.p06, focal: [50, 55], desktop: [3, 2], mobile: [4, 3] })),
  "home.casamientos": use("home.casamientos", make({ ...P.p03, focal: [50, 55], desktop: [5, 4], mobile: [4, 3], eventType: "casamientos" })),
  "home.empresas": use("home.empresas", make({ ...P.p05, focal: [45, 62], desktop: [16, 10], mobile: [3, 2] })),
  "home.lluvia": use("home.lluvia", make({ ...P.p13, focal: [50, 45], desktop: [3, 2], mobile: [4, 3] })),
  "home.visita": use("home.visita", make({ ...P.p02, focal: [50, 55], desktop: [3, 2], mobile: [4, 3] })),

  // Casamientos
  "casamientos.hero": use("casamientos.hero", make({ ...P.p09, focal: [40, 55], desktop: [21, 9], mobile: [4, 5], eventType: "casamientos" })),
  "casamientos.ceremonia": use("casamientos.ceremonia", make({ ...P.p03, focal: [50, 55], eventType: "casamientos" })),
  "casamientos.parque": use("casamientos.parque", make({ ...P.p06, focal: [50, 55] })),
  "casamientos.interior": use("casamientos.interior", make({ ...P.p13, focal: [50, 50] })),
  "casamientos.servicios": use("casamientos.servicios", make({ ...P.p07, focal: [50, 50] })),
  "casamientos.lluvia": use("casamientos.lluvia", make({ ...P.p13, focal: [40, 50] })),

  // Eventos de empresa
  "empresas.hero": use("empresas.hero", make({ ...P.p05, focal: [45, 60], desktop: [21, 9], mobile: [4, 5] })),
  "empresas.encuentro": use("empresas.encuentro", make({ ...P.p06, focal: [50, 55] })),
  "empresas.espacios": use("empresas.espacios", make({ ...P.p01, focal: [50, 60], desktop: [3, 2], mobile: [4, 3] })),
  "empresas.servicios": use("empresas.servicios", make({ ...P.p07, focal: [50, 50] })),

  // Espacios
  "espacios.hero": use("espacios.hero", make({ ...P.p01, focal: [55, 60], desktop: [21, 9], mobile: [4, 5] })),
  "espacios.parque": use("espacios.parque", make({ ...P.p02, focal: [50, 55] })),
  "espacios.cubierto": use("espacios.cubierto", make({ ...P.p13, focal: [50, 50] })),
  "espacios.ceremonia": use("espacios.ceremonia", make({ ...P.p03, focal: [50, 55] })),
  "espacios.llegada": use("espacios.llegada", make({ ...P.p05, focal: [50, 60] })),
  "espacios.banos": use("espacios.banos", make({ ...P.p08, focal: [50, 50] })),

  // Contacto
  "contacto.hero": use("contacto.hero", make({ ...P.p02, focal: [50, 55], desktop: [3, 2], mobile: [4, 3] })),
  "contacto.entrada": use("contacto.entrada", make({ ...P.p01, focal: [50, 60], desktop: [3, 2], mobile: [4, 3] })),

  // Social
  "og.default": use("og.default", make({ ...P.p01, focal: [55, 60], desktop: [1200, 630], mobile: [1200, 630] })),
  equipo: use("equipo", make({ ...P.p10, focal: [50, 45], desktop: [3, 2], mobile: [4, 3] })),

  // Eventos reales: galería (cada una con tipo de evento)
  "reales.1": use("reales.1", make({ ...P.p09, focal: [40, 55], eventType: "casamientos" })),
  "reales.2": use("reales.2", make({ ...P.p03, focal: [50, 55], eventType: "casamientos" })),
  "reales.3": use("reales.3", make({ ...P.p10, focal: [50, 45], eventType: "casamientos" })),
  "reales.4": use("reales.4", make({ ...P.p04, focal: [50, 40], eventType: "casamientos" })),
  "reales.5": use("reales.5", make({ ...P.p06, focal: [50, 55], eventType: "casamientos" })),
  "reales.6": use("reales.6", make({ ...P.p11, focal: [50, 55], eventType: "casamientos" })),
  "reales.7": use("reales.7", make({ ...P.p12, focal: [50, 55], eventType: "casamientos" })),
  "reales.8": use("reales.8", make({ ...P.p14, focal: [50, 40], eventType: "casamientos" })),
  "reales.9": use("reales.9", make({ ...P.p13, focal: [50, 50], eventType: "clima" })),
} satisfies Record<string, Slot>;

/** `sizes` del hero: contenedor con ancho máximo (o 100vw en pantallas chicas). */
export const HERO_SIZES = "(min-width: 1200px) 1200px, 100vw";

export type SlotName = keyof typeof slots;
