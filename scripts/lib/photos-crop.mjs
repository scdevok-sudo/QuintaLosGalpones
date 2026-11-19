// Geometría de recortes compartida por photos:build, photos:verify y photos:sheet.
// Todas las cajas están en píxeles del original (ya rotado), salvo `subject`, que va en fracciones 0..1 del original.

/** Breakpoints de revisión: ancho de ventana (px) y si el sitio los trata como "mobile" (variante propia). */
export const VIEWPORTS = [360, 390, 412, 768, 1280, 1440, 1920];
/** Escritorio: de 1024 px en adelante; "wide" (pantallas anchas) desde 1600 px. Se revisan 1280, 1440 y 1920. */
export const DESKTOP_MIN = 1024;
export const WIDE_MIN = 1600;
export const DESKTOP_VIEWPORTS = [1280, 1440, 1920];

/**
 * Recorte de relación [a, b] centrado en `focal` (fracciones 0..1 del original completo). `trim` = [arriba, derecha,
 * abajo, izquierda] en px: descarta bordes negros de captura antes de encuadrar. Nunca sale del área recortada.
 */
export function cropBox(fullW, fullH, [a, b], { x, y }, trim = [0, 0, 0, 0]) {
  const [tt, tr, tb, tl] = trim;
  const w = fullW - tl - tr;
  const h = fullH - tt - tb;
  const t = a / b;
  const cw = Math.min(w, Math.floor(h * t));
  const ch = Math.min(h, Math.round(cw / t));
  const left = Math.round(Math.min(Math.max(x * fullW - tl - cw / 2, 0), w - cw)) + tl;
  const top = Math.round(Math.min(Math.max(y * fullH - tt - ch / 2, 0), h - ch)) + tt;
  return { left, top, width: cw, height: ch };
}

/**
 * Parte de `crop` que se ve cuando se muestra en un contenedor de relación `aspect` (ancho/alto) con
 * object-fit: cover y object-position `pos` (fracciones 0..1 del recorte). `zoom` > 1 (parallax) achica la ventana al centro.
 */
export function visibleWindow(crop, aspect, pos = [0.5, 0.5], zoom = 1) {
  const r = crop.width / crop.height;
  let fw = 1;
  let fh = 1;
  if (aspect > r) fh = r / aspect;
  else fw = aspect / r;
  const x = crop.left + crop.width * (1 - fw) * pos[0];
  const y = crop.top + crop.height * (1 - fh) * pos[1];
  const w = crop.width * fw;
  const h = crop.height * fh;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return { x0: cx - w / zoom / 2, y0: cy - h / zoom / 2, x1: cx + w / zoom / 2, y1: cy + h / zoom / 2 };
}

/** Caja del sujeto en píxeles del original. */
export const subjectPx = (s, W, H) => ({ x0: s.x0 * W, y0: s.y0 * H, x1: s.x1 * W, y1: s.y1 * H });

/** ¿La ventana contiene al sujeto entero? Devuelve el exceso (px del original) por lado si no. */
export function missing(win, sub) {
  const m = { izquierda: win.x0 - sub.x0, arriba: win.y0 - sub.y0, derecha: sub.x1 - win.x1, abajo: sub.y1 - win.y1 };
  return Object.entries(m).filter(([, v]) => v > 1).map(([k, v]) => `${k} ${Math.round(v)} px`);
}

/** Variante que usa un viewport: la mobile si existe y el ancho entra en su `maxWidth`. */
export const usesMobile = (slot, vw) => Boolean(slot.mobileCrop) && vw <= slot.mobileCrop.maxWidth;

/**
 * Recorte propio de escritorio ("desktop" o "wide") que corresponde a un viewport, o null si usa el recorte base.
 * "wide" hereda de "desktop" si no se declara. Un recorte propio se muestra entero: el contenedor toma su relación.
 */
export function artAt(slot, vw) {
  if (vw < DESKTOP_MIN || usesMobile(slot, vw)) return null;
  if (vw >= WIDE_MIN && slot.wideCrop) return { key: "wide", ...slot.wideCrop };
  if (slot.desktopCrop) return { key: "desktop", ...slot.desktopCrop };
  return null;
}

/** Relación (ancho/alto) del contenedor de la foto en cada viewport. `vistas` del slot manda; si no, la declarada. */
export function aspectAt(slot, vw) {
  const art = artAt(slot, vw);
  if (art) return art.aspect[0] / art.aspect[1];
  const v = slot.vistas?.[String(vw)];
  if (v) return v;
  const ar = vw >= 768 ? slot.desktop : Array.isArray(slot.mobile) ? slot.mobile : slot.mobile.aspect;
  return ar[0] / ar[1];
}

/**
 * Ranura normalizada. `mobile`, `desktop` y `wide` admiten una relación [a, b] (recorte base, como antes) o un objeto
 * { aspect, focal, maxWidth, layout, fotos }. Con objeto, la relación declarada pasa a `mobile` / `desktop` y el recorte
 * propio queda en `mobileCrop` / `desktopCrop` / `wideCrop`.
 *   layout: "cover" (llena el contenedor), "split" (vertical a la altura del contenedor junto al texto) o
 *           "mosaico" (2 o 3 verticales juntas; `fotos` lista las demás: { foto, aspect, focal }).
 */
export function normSlot(s) {
  const o = { ...s };
  if (!Array.isArray(s.mobile)) Object.assign(o, { mobile: s.mobile.aspect, mobileCrop: s.mobile });
  // `desktop.base` = relación del contenedor entre 768 y 1023 px, donde todavía rige el recorte base (por defecto 4:3).
  if (!Array.isArray(s.desktop)) {
    const { base, ...art } = s.desktop;
    Object.assign(o, { desktop: base ?? [4, 3], desktopCrop: { layout: "cover", ...art } });
  }
  if (s.wide) o.wideCrop = { ...(o.desktopCrop ?? {}), ...s.wide };
  if (o.wideCrop) o.wideCrop.layout ??= o.desktopCrop?.layout ?? "cover";
  return o;
}

/** Miembros de un mosaico: la foto principal (con su recorte) y las demás que declara `fotos`. */
export function mosaicMembers(slot, art) {
  if (art.layout !== "mosaico") return [];
  return [{ foto: slot.foto, aspect: art.aspect, focal: art.focal, i: 0 }, ...(art.fotos ?? []).map((m, i) => ({ ...m, i: i + 1 }))];
}
