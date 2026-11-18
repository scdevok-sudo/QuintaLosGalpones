// npm run map:build  ·  Mapa estático on-brand de la quinta, generado UNA vez con datos de OpenStreetMap.
//
// - Consulta Overpass (calles, agua) y la autopista cercana. Respeta la política de uso: un User-Agent propio,
//   reintentos con espera creciente y un caché en scripts/map-data/ (no se vuelve a pedir salvo con --refresh).
// - Dibuja dos SVG livianos con la paleta del sitio (fondo noche, calles tenues, pin lamparita):
//   public/map/quinta-4x3.svg (celular) y public/map/quinta-16x10.svg (escritorio).
// - Las etiquetas son texto HTML (tipografía del sitio, accesible): se escriben en src/content/mapa.generated.ts.
// El pin usa site.coordinates; mientras no estén validadas es el centro de la calle (ver docs/INFORME-MAPA.md).
// Datos © colaboradores de OpenStreetMap (ODbL). La atribución se muestra sobre el mapa.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "quinta-los-galpones-map-build/1.0 (generacion unica de mapa estatico)";
const refresh = process.argv.includes("--refresh");

// ---- Punto de la quinta: se lee de src/config/site.ts (única fuente) ----
const siteSrc = readFileSync(join(root, "src/config/site.ts"), "utf8");
const m = siteSrc.match(/coordinates:\s*\{\s*value:\s*\{\s*lat:\s*(-?[\d.]+),\s*lng:\s*(-?[\d.]+)\s*\}/);
if (!m) throw new Error("site.coordinates.value no tiene lat/lng. Geocodificá la dirección y cargalas en src/config/site.ts.");
const C = { lat: Number(m[1]), lng: Number(m[2]) };

// ---- Datos de OSM, con caché ----
const cache = join(root, "scripts/map-data/overpass.json");
const MIRRORS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const dLat = 0.016, dLng = 0.02; // ~1,8 km x 1,9 km alrededor del punto
const bbox = `${C.lat - dLat},${C.lng - dLng},${C.lat + dLat},${C.lng + dLng}`;
const query = `[out:json][timeout:60];(
  way["highway"]["highway"!~"footway|steps|path|cycleway|pedestrian|bridleway|corridor|proposed|construction"](${bbox});
  way["waterway"~"river|stream|canal"](${bbox});
  way["natural"="water"](${bbox});
  way["highway"~"motorway|trunk"]["name"~"Panamericana|Acceso Norte"](around:6000,${C.lat},${C.lng});
);out geom tags;`;

async function fetchOverpass() {
  let wait = 10000;
  for (let ronda = 0; ronda < 4; ronda++) {
    for (const url of MIRRORS) {
      try {
        const r = await fetch(url, { method: "POST", headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(query) });
        const t = await r.text();
        if (r.ok && t.startsWith("{")) { console.log("Overpass OK:", url); return JSON.parse(t); }
        console.log("Overpass", r.status, url);
      } catch (e) { console.log("Overpass error", url, e.message); }
      await new Promise((ok) => setTimeout(ok, 3000));
    }
    console.log(`Espero ${wait / 1000}s y reintento...`);
    await new Promise((ok) => setTimeout(ok, wait));
    wait *= 2;
  }
  throw new Error("Overpass no respondió. Probá de nuevo más tarde (npm run map:build -- --refresh).");
}
mkdirSync(dirname(cache), { recursive: true });
let osm;
try { if (!refresh && existsSync(cache)) osm = JSON.parse(readFileSync(cache, "utf8")); } catch {}
if (!osm)
{ osm = await fetchOverpass(); writeFileSync(cache, JSON.stringify(osm)); }

// ---- Proyección equirectangular local (metros) ----
const R = 6371008.8, rad = Math.PI / 180;
const mx = (lng) => (lng - C.lng) * rad * R * Math.cos(C.lat * rad);
const my = (lat) => -(lat - C.lat) * rad * R; // y hacia abajo
const MPU = 1.25; // metros por unidad de SVG: misma escala en ambos formatos

const palette = { noche: "#151d18", noche2: "#1d2822", calle: "#6f836f", calleMayor: "#a9b59f", agua: "#223a38", lampara: "#ffb347", tarde: "#e9e6d2" };
const rank = { motorway: 6, trunk: 6, primary: 5, secondary: 4, tertiary: 3, unclassified: 2, residential: 2, service: 1, track: 1, living_street: 2 };
const width = (hw) => ({ 6: 11, 5: 9, 4: 7, 3: 5.5, 2: 4, 1: 2.4 }[rank[hw] ?? 2]);
const ways = osm.elements.filter((e) => e.type === "way" && e.geometry);
const isMajor = (w) => (rank[w.tags.highway] ?? 0) >= 4;

const variants = [
  { id: "4x3", w: 1200, h: 900, py: 0.4, k: 1, y0: 0.24, y1: 0.54 },
  { id: "16x10", w: 1280, h: 800, py: 0.42, k: 0.62, y0: 0.2, y1: 0.7 },
];

const labelsOut = {};
for (const v of variants) {
  const ox = v.w / 2, oy = v.h * v.py; // posición del pin
  const toXY = (g) => [ox + mx(g.lon) / MPU, oy + my(g.lat) / MPU];
  const inView = (x, y, pad = 80) => x > -pad && x < v.w + pad && y > -pad && y < v.h + pad;
  const d = (geom) => geom.map((g, i) => { const [x, y] = toXY(g); return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); }).join("");
  const visible = (w) => w.geometry.some((g) => { const [x, y] = toXY(g); return inView(x, y); });

  const water = ways.filter((w) => (w.tags.natural === "water" || w.tags.waterway) && visible(w));
  const roads = ways.filter((w) => w.tags.highway && visible(w)).sort((a, b) => (rank[a.tags.highway] ?? 2) - (rank[b.tags.highway] ?? 2));
  const minor = roads.filter((w) => !isMajor(w));
  const major = roads.filter(isMajor);

  const parts = [];
  parts.push(`<rect width="${v.w}" height="${v.h}" fill="${palette.noche2}"/>`);
  parts.push(`<rect width="${v.w}" height="${v.h}" fill="url(#vg)"/>`);
  for (const w of water) {
    const closed = w.tags.natural === "water";
    parts.push(closed ? `<path d="${d(w.geometry)}Z" fill="${palette.agua}"/>` : `<path d="${d(w.geometry)}" fill="none" stroke="${palette.agua}" stroke-width="${(5 * v.k + 2).toFixed(1)}" stroke-linecap="round"/>`);
  }
  // Calles menores: una sola ruta con un trazo (liviano); las mayores agrupadas por jerarquía.
  const grp = (list, hw) => list.filter((w) => w.tags.highway === hw).map((w) => d(w.geometry)).join("");
  for (const hw of ["service", "track"]) { const p = grp(minor, hw); if (p) parts.push(`<path d="${p}" fill="none" stroke="${palette.calle}" stroke-opacity=".28" stroke-width="${(width(hw) * v.k + 0.8).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`); }
  const res = minor.filter((w) => !["service", "track"].includes(w.tags.highway)).map((w) => d(w.geometry)).join("");
  parts.push(`<path d="${res}" fill="none" stroke="${palette.calle}" stroke-opacity=".5" stroke-width="${(4 * v.k + 1).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  for (const hw of ["tertiary", "secondary", "primary", "trunk", "motorway"]) {
    const p = grp(major, hw); if (!p) continue;
    const wd = width(hw) * v.k + 1.5;
    parts.push(`<path d="${p}" fill="none" stroke="${palette.noche}" stroke-width="${(wd + 3).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    parts.push(`<path d="${p}" fill="none" stroke="${palette.calleMayor}" stroke-opacity=".75" stroke-width="${wd.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  // Resalta la calle de la quinta
  const calle = ways.filter((w) => w.tags.name === "Quintino Bocayuva" && w.tags.highway && visible(w)).map((w) => d(w.geometry)).join("");
  if (calle) parts.push(`<path d="${calle}" fill="none" stroke="${palette.tarde}" stroke-opacity=".8" stroke-width="${(5 * v.k + 1.5).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  // Pin lamparita: halo, bulbo y casquillo
  const s = v.k < 1 ? 1.35 : 2.2;
  parts.push(`<g transform="translate(${ox} ${oy}) scale(${s})">
<circle r="38" fill="${palette.lampara}" fill-opacity=".14"/><circle r="24" fill="${palette.lampara}" fill-opacity=".22"/>
<path d="M0 -24C-12 -24 -19 -15 -19 -6c0 7 4 11 8 16 2 2 3 4 3 7h16c0-3 1-5 3-7 4-5 8-9 8-16 0-9-7-18-19-18z" fill="${palette.lampara}" stroke="${palette.noche}" stroke-width="3" transform="translate(0 -6)"/>
<rect x="-8" y="11" width="16" height="9" rx="2" fill="${palette.tarde}" stroke="${palette.noche}" stroke-width="3"/>
<circle r="3.5" cx="0" cy="-12" fill="${palette.noche}" fill-opacity=".35"/></g>`);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${v.w} ${v.h}" width="${v.w}" height="${v.h}">
<defs><radialGradient id="vg" cx=".5" cy="${v.py}" r=".75"><stop offset="0" stop-color="${palette.noche2}" stop-opacity="0"/><stop offset="1" stop-color="${palette.noche}" stop-opacity=".85"/></radialGradient></defs>
${parts.join("\n")}
</svg>
`;
  mkdirSync(join(root, "public/map"), { recursive: true });
  writeFileSync(join(root, `public/map/quinta-${v.id}.svg`), svg);
  console.log(`quinta-${v.id}.svg  ${(svg.length / 1024).toFixed(1)} KB  (${roads.length} calles, ${water.length} cuerpos de agua)`);

  // ---- Etiquetas (HTML): calles mayores con nombre dentro del cuadro + autopista cercana ----
  const labels = [];
  const pct = (x, y) => ({ x: +((x / v.w) * 100).toFixed(1), y: +((y / v.h) * 100).toFixed(1) });
  const seen = new Set();
  const inner = (x, y) => x > v.w * 0.2 && x < v.w * 0.8 && y > v.h * v.y0 && y < v.h * v.y1; // franja libre: sin atribución arriba ni cartel abajo
  const pin = { x: ox, y: oy };
  const far = (x, y) => Math.hypot(x - pin.x, y - pin.y) > 150;
  const cand = ways.filter((w) => w.tags.name && w.tags.highway && (rank[w.tags.highway] ?? 0) >= 3 && !/Panamericana|Acceso Norte|Autopista/i.test(w.tags.name));
  for (const w of cand.sort((a, b) => (rank[b.tags.highway] ?? 0) - (rank[a.tags.highway] ?? 0))) {
    if (seen.has(w.tags.name)) continue;
    const pts = w.geometry.map(toXY).filter(([x, y]) => inner(x, y) && far(x, y));
    if (!pts.length) continue;
    const [x, y] = pts[Math.floor(pts.length / 2)];
    if (ways.some((o) => /Panamericana|Acceso Norte|Autopista/i.test(o.tags.name || "") && o.geometry.some((g) => { const [qx, qy] = toXY(g); return Math.hypot(qx - x, qy - y) < 170; }))) continue;
    if (labels.some((l) => Math.hypot(l.px - x, l.py - y) < 190)) continue;
    seen.add(w.tags.name);
    labels.push({ text: w.tags.name, ...pct(x, y), px: x, py: y });
    if (labels.length >= 3) break;
  }
  const calleLabel = (() => {
    const pts = ways.filter((w) => w.tags.name === "Quintino Bocayuva" && w.tags.highway).flatMap((w) => w.geometry.map(toXY)).filter(([x, y]) => inner(x, y) && Math.hypot(x - pin.x, y - pin.y) > 90);
    if (!pts.length) return null;
    const [x, y] = pts.sort((a, b) => Math.hypot(a[0] - pin.x, a[1] - pin.y) - Math.hypot(b[0] - pin.x, b[1] - pin.y))[0];
    return { text: "Quintino Bocayuva", ...pct(x, y), strong: true };
  })();
  // Panamericana: si el trazado cruza el cuadro se etiqueta ahí; si no, un indicador de borde con distancia y rumbo reales.
  const pan = ways.filter((w) => /Panamericana|Acceso Norte/i.test(w.tags.name || "") && w.tags.highway);
  let panLabel = null;
  if (pan.length) {
    const pts = pan.flatMap((w) => w.geometry);
    let best = null;
    for (const g of pts) { const dist = Math.hypot(mx(g.lon), my(g.lat)); if (!best || dist < best.dist) best = { dist, g }; }
    const [bx, by] = toXY(best.g);
    if (inner(bx, by)) panLabel = { text: "Panamericana", ...pct(bx, by) };
    else {
      const ang = Math.atan2(-my(best.g.lat), mx(best.g.lng ?? best.g.lon)); // 0 = este, antihorario
      const dirs = ["al este", "al noreste", "al norte", "al noroeste", "al oeste", "al suroeste", "al sur", "al sureste"];
      const dir = dirs[Math.round(((ang / (Math.PI / 4)) + 8) % 8)];
      const km = (best.dist / 1000).toFixed(1).replace(".", ",");
      panLabel = { text: `Panamericana a ${km} km ${dir}`, edge: true, ...pct(ox + Math.cos(ang) * (v.w / 2 - 20), oy - Math.sin(ang) * Math.min(oy - 50, v.h - oy - 120)) };
    }
  }
  labelsOut[v.id] = [calleLabel, panLabel, ...labels.slice(0, calleLabel ? 2 : 3)].filter(Boolean).map(({ px, py, ...l }) => l);
}

const ts = `// Generado por scripts/map-build.mjs (npm run map:build). No editar a mano.
// Etiquetas del mapa estático, en % del cuadro. Datos © colaboradores de OpenStreetMap.
export type MapLabel = { text: string; x: number; y: number; strong?: boolean; edge?: boolean };
export const mapLabels: Record<"4x3" | "16x10", MapLabel[]> = ${JSON.stringify(labelsOut, null, 2)};
`;
mkdirSync(join(root, "src/content"), { recursive: true });
writeFileSync(join(root, "src/content/mapa.generated.ts"), ts);
console.log("Etiquetas:", JSON.stringify(labelsOut));
