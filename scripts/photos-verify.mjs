// photos:verify: falla si las fotos procesadas no cumplen las reglas del proyecto.
// Nombre con patron, sin repetir; sin EXIF/GPS/ICC; sin agrandar; alt, width y height; presupuesto de peso;
// y que cada ranura de las paginas tenga foto (nueva o provisoria declarada) y ninguna bloqueada.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { VIEWPORTS, aspectAt, missing, subjectPx, usesMobile, visibleWindow } from "./lib/photos-crop.mjs";

const cfg = JSON.parse(readFileSync("photos.config.json", "utf8"));
const manifest = JSON.parse(readFileSync("src/data/photos.manifest.json", "utf8"));
const slotMap = JSON.parse(readFileSync("src/data/photos.slots.json", "utf8"));
const OUT = cfg.salida;
const SECCIONES = ["inicio-hero", "recorrido-1", "recorrido-2", "recorrido-3", "recorrido-4", "casamientos-hero", "casamientos-galeria", "espacios-parque", "espacios-galpon", "espacios-cubierto", "lluvia", "mapa-fachada", "og", "cierre-noche", "empresas", "eventos-reales"];
const MOMENTOS = ["dia", "tarde", "atardecer", "noche", "interior"];
const HERO = new Set(["inicio-hero", "casamientos-hero"]);
const errors = [];
const warns = [];
const err = (m) => errors.push(m);

// 1. Nombres
const seen = new Set();
for (const m of manifest) {
  if (m.estado === "bloqueada") continue;
  const n = m.nombre;
  const okSec = SECCIONES.some((s) => n?.startsWith(s + "-"));
  const re = new RegExp(`^[a-z0-9]+(-[a-z0-9]+)*-(${MOMENTOS.join("|")})-\\d{2}$`);
  if (!n || !okSec || !re.test(n)) err(`${m.id}: nombre fuera de patron: ${n}`);
  if (/f\d{3}|santi|diego|quinta|galpones/i.test(n ?? "")) err(`${m.id}: el nombre tiene un ID o un dato del cliente: ${n}`);
  if (seen.has(n)) err(`${m.id}: nombre repetido: ${n}`);
  seen.add(n);
}

// 2. Salidas
const files = existsSync(OUT) ? readdirSync(OUT) : [];
const expected = new Set();
for (const m of manifest) {
  if (m.estado === "bloqueada" || m.generada === false) continue;
  if (!m.alt && !m.decorativa) err(`${m.id}: falta alt`);
  if (!m.jpeg?.width || !m.jpeg?.height) err(`${m.id}: faltan width/height`);
  const exts = m.seccion === "og" ? [] : ["avif"];
  const list = [...exts.flatMap((e) => m.anchosGenerados.map((w) => `${m.nombre}-w${w}.${e}`)), `${m.nombre}-w${m.jpeg?.width}.jpg`];
  for (const f of list) {
    expected.add(f);
    if (!existsSync(join(OUT, f))) { err(`${m.id}: falta ${f}`); continue; }
    const meta = await sharp(join(OUT, f)).metadata();
    if (meta.exif || meta.icc || meta.xmp || meta.iptc || meta.tifftagPhotoshop) err(`${f}: tiene metadatos (EXIF/ICC/XMP/IPTC)`);
    const w = Number(f.match(/-w(\d+)\./)[1]);
    if (meta.width !== w) err(`${f}: el ancho real (${meta.width}) no coincide con el nombre`);
    if (meta.width > m.dimensionesOriginal.w || meta.width > m.recorte.w) err(`${f}: mas ancho que el original (${meta.width} > ${Math.min(m.dimensionesOriginal.w, m.recorte.w)}): se agrando`);
    if (meta.height > m.dimensionesOriginal.h) err(`${f}: mas alto que el original (se agrando)`);
  }
  if (m.seccion !== "og") {
    const ref = Math.max(...m.anchosGenerados.filter((w) => w <= 1440));
    const kb = statSync(join(OUT, `${m.nombre}-w${ref}.avif`)).size / 1024;
    const budget = HERO.has(m.seccion) ? 200 : 120;
    if (kb > budget) err(`${m.id}: AVIF a ${ref} px pesa ${Math.round(kb)} KB (presupuesto ${budget} KB)`);
  }
}
// 2b. Variantes mobile (dirección de arte): archivos, sin metadatos, sin agrandar, peso.
for (const m of manifest) {
  for (const [slot, v] of Object.entries(m.mobile ?? {})) {
    for (const w of v.widths) {
      const f = `${v.nombre}-w${w}.avif`;
      expected.add(f);
      if (!existsSync(join(OUT, f))) { err(`${m.id} ${slot}: falta ${f}`); continue; }
      const meta = await sharp(join(OUT, f)).metadata();
      if (meta.exif || meta.icc || meta.xmp || meta.iptc) err(`${f}: tiene metadatos`);
      if (meta.width !== w) err(`${f}: el ancho real (${meta.width}) no coincide con el nombre`);
      if (w > v.box.width) err(`${f}: mas ancho que su recorte (${v.box.width}): se agrando`);
    }
    const ref = Math.max(...v.widths.filter((w) => w <= 960));
    const kb = statSync(join(OUT, `${v.nombre}-w${ref}.avif`)).size / 1024;
    if (kb > 120) err(`${m.id} ${slot}: AVIF mobile a ${ref} px pesa ${Math.round(kb)} KB (presupuesto 120 KB)`);
  }
}
for (const f of files) if (!expected.has(f)) warns.push(`Archivo huerfano en ${OUT}: ${f}`);

// 3. Ranuras
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const src = [...walk("app"), ...walk("src")].filter((f) => /\.(tsx?|ts)$/.test(f));
const refs = new Set();
for (const f of src) {
  if (f.endsWith("photos.ts")) continue;
  const t = readFileSync(f, "utf8");
  for (const m of t.matchAll(/slot[=:]\s*\{?\s*"([\w.]+)"/g)) refs.add(m[1]);
  for (const m of t.matchAll(/preloadHero\("([\w.]+)"\)|slots\["([\w.]+)"\]/g)) refs.add(m[1] ?? m[2]);
}
const photosTs = readFileSync("src/content/photos.ts", "utf8");
const defined = new Set([...photosTs.matchAll(/^\s+"?([\w.]+)"?: use\(/gm)].map((m) => m[1]));
for (const r of refs) {
  if (!defined.has(r)) { err(`La ranura "${r}" la usa una pagina y no esta definida en photos.ts`); continue; }
  const c = slotMap[r];
  if (!c) { warns.push(`Ranura "${r}": sin foto nueva, usa la provisoria del sitio actual`); continue; }
  const m = manifest.find((x) => x.id === c.foto && x.seccion !== "og");
  if (!m) err(`Ranura "${r}": la foto ${c.foto} no esta en el manifiesto`);
  else if (m.generada === false) err(`Ranura "${r}": la foto ${c.foto} es de reserva y no esta generada: correr npm run photos:build`);
  else if (m.estado === "bloqueada") err(`Ranura "${r}": usa la foto ${c.foto}, que esta bloqueada`);
}
for (const k of Object.keys(slotMap)) if (!defined.has(k)) warns.push(`photos.config.json define la ranura "${k}", que no existe en photos.ts`);

// 4. El sujeto de cada foto entra entero en lo que se ve de cada ranura, en cada breakpoint (misma regla que photos:build).
for (const [name, slot] of Object.entries(slotMap)) {
  const m = manifest.find((x) => x.id === slot.foto && x.seccion !== "og");
  if (!m || m.generada === false) continue;
  if (!m.subject) { err(`${m.id}: falta subject en el manifiesto (correr photos:build)`); continue; }
  const { w: W, h: H } = m.dimensionesOriginal;
  const base = { left: m.recorte.left, top: m.recorte.top, width: m.recorte.w, height: m.recorte.h };
  for (const vw of VIEWPORTS) {
    const mob = usesMobile(slot, vw);
    const mv = mob ? m.mobile?.[name] : null;
    if (mob && !mv) { err(`Ranura "${name}": tiene recorte mobile y el manifiesto no (correr photos:build)`); continue; }
    const crop = mob ? mv.box : base;
    const pos = mob ? [0.5, 0.5] : (slot.focal ?? [50, 50]).map((v) => v / 100);
    const sub = (mob && slot.mobileSubject) || slot.subject || m.subject;
    const miss = missing(visibleWindow(crop, aspectAt(slot, vw), pos, vw >= 1024 ? slot.zoom ?? 1 : 1), subjectPx(sub, W, H));
    if (miss.length) err(`Ranura "${name}" a ${vw} px: el recorte ${mob ? "mobile" : "base"} corta el sujeto (le falta ${miss.join(", ")})`);
  }
}

const n = manifest.filter((m) => m.estado !== "bloqueada").length;
console.log(`photos:verify: ${n} fotos procesadas, ${manifest.length - n} bloqueadas, ${refs.size} ranuras usadas por paginas.`);
for (const w of warns) console.log("  aviso: " + w);
if (errors.length) {
  console.error("\nERRORES:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log("OK");
