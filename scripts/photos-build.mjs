// photos:build: procesa las fotos de photos.config.json y escribe public/photos/ y src/data/photos.manifest.json.
// Solo recorta, redimensiona, convierte y comprime. No retoca, no agranda, no publica metadatos.
// Reemplazar un original: copiarlo con el mismo nombre en la carpeta `fuente` y correr `npm run photos:build`.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const cfg = JSON.parse(readFileSync("photos.config.json", "utf8"));
const OUT = cfg.salida;
const WORK = ".photos-work";
const WIDTHS = [640, 960, 1440, 2000];
const HERO_SECTIONS = new Set(["inicio-hero", "casamientos-hero"]);
const only = process.argv.slice(2).filter((a) => /^F\d{3}$/.test(a));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(WORK, { recursive: true });

/** Lee el original; HEIC pasa por un intermedio PNG sin perdida. Devuelve un PNG sRGB, rotado, listo para recortar. */
async function load(f) {
  let file = join(cfg.fuente, f.original);
  if (!existsSync(file)) throw new Error(`No esta el original: ${file}`);
  if (/\.hei[cf]$/i.test(file)) {
    const mid = join(WORK, `${f.id}.png`);
    execFileSync("python", ["-I", "scripts/heic-to-png.py", file, mid]);
    file = mid;
  }
  const buf = await sharp(file, { failOn: "none" }).rotate().withIccProfile("srgb").png({ compressionLevel: 1 }).toBuffer();
  const m = await sharp(buf).metadata();
  return { buf, w: m.width, h: m.height };
}

/**
 * Recorte centrado en el punto focal (0 a 1, sobre el original completo). `trim` = [arriba, derecha, abajo, izquierda]
 * en px: descarta bordes negros de captura antes de encuadrar. Nunca sale del area recortada.
 */
function cropBox(fullW, fullH, [a, b], { x, y }, trim = [0, 0, 0, 0]) {
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

const enc = {
  avif: (s, q) => s.avif({ quality: q, effort: 4 }),
  webp: (s, q) => s.webp({ quality: q, effort: 4 }),
  jpg: (s, q) => s.jpeg({ quality: q, progressive: true, mozjpeg: true }),
};

const counters = new Map();
const nameFor = (f) => {
  const base = `${f.seccion}-${f.sujeto}-${f.momento}`;
  const n = (counters.get(base) ?? 0) + 1;
  counters.set(base, n);
  return `${base}-${String(n).padStart(2, "0")}`;
};

const manifest = [];
for (const f of cfg.fotos) {
  if (!f.procesar) {
    let dim = null;
    try {
      const m = await sharp(join(cfg.fuente, f.original), { failOn: "none" }).metadata();
      dim = { w: m.width, h: m.height };
    } catch {}
    manifest.push({ id: f.id, original: f.original, nombre: null, ranuras: [], momento: null, focal: null, dimensionesOriginal: dim, anchosGenerados: [], lqip: null, alt: "", estado: "bloqueada", pendientes: [], personas: f.personas, nota: f.motivo ?? f.nota });
    continue;
  }
  const nombre = nameFor(f);
  if (only.length && !only.includes(f.id)) continue;
  const src = await load(f);
  const box = cropBox(src.w, src.h, f.ratio, f.focal, f.trim);
  const master = await sharp(src.buf).extract(box).png({ compressionLevel: 1 }).toBuffer();
  const widths = WIDTHS.filter((w) => w <= box.width);
  if (box.width < 2000 && !widths.includes(box.width)) widths.push(box.width);
  const wRef = Math.max(...widths.filter((w) => w <= 1440));
  const budget = HERO_SECTIONS.has(f.seccion) ? 200 : 120;
  const h = (w) => Math.round((w * box.height) / box.width);
  // Primero baja la calidad; la resolucion no se toca.
  let q = 55;
  let size;
  for (;;) {
    size = (await enc.avif(sharp(master).resize(wRef, h(wRef)), q).toBuffer()).length;
    if (size <= budget * 1024 || q <= 30) break;
    q -= 5;
  }
  const sizes = {};
  for (const w of widths) {
    const img = () => sharp(master).resize(w, h(w), { kernel: "lanczos3" });
    const avif = await enc.avif(img(), q).toBuffer();
    const webp = await enc.webp(img(), 78).toBuffer();
    writeFileSync(join(OUT, `${nombre}-w${w}.avif`), avif);
    writeFileSync(join(OUT, `${nombre}-w${w}.webp`), webp);
    sizes[w] = { avif: avif.length, webp: webp.length };
  }
  const jpg = await enc.jpg(sharp(master).resize(wRef, h(wRef), { kernel: "lanczos3" }), 80).toBuffer();
  writeFileSync(join(OUT, `${nombre}-w${wRef}.jpg`), jpg);
  const lqipBuf = await sharp(master).resize(24).jpeg({ quality: 45 }).toBuffer();
  const orig = { w: src.w, h: src.h };
  const pend = [];
  if (f.dudas?.procedencia && !f.confirmado?.procedencia) pend.push("procedencia");
  if (f.dudas?.rostros && !f.confirmado?.rostros) pend.push("rostros");
  // Resolucion utilizable: lado largo del recorte que se publica (no del original completo).
  if (Math.max(box.width, box.height) < 2000) pend.push("resolucion");
  const nota = [f.nota, q < 50 ? `AVIF a calidad ${q} para entrar en ${budget} KB.` : ""].filter(Boolean).join(" ");
  manifest.push({
    id: f.id, original: f.original, nombre, seccion: f.seccion, ranuras: f.ranuras, momento: f.momento, focal: f.focal,
    dimensionesOriginal: orig, recorte: { ratio: f.ratio, w: box.width, h: box.height },
    anchosGenerados: widths, jpeg: { width: wRef, height: h(wRef) }, lqip: `data:image/jpeg;base64,${lqipBuf.toString("base64")}`,
    alt: f.alt, estado: pend.length ? `provisoria-${pend[0]}` : "ok", pendientes: pend, personas: f.personas,
    calidadAvif: q, pesoAvif1440: sizes[wRef].avif, nota,
  });
  console.log(`${f.id} ${nombre} ${widths.join("/")} avif@${wRef}=${Math.round(sizes[wRef].avif / 1024)}KB q${q} ${pend.length ? "provisoria-" + pend.join("+") : "ok"}`);
}

// Open Graph: JPEG 1200x630, sin texto superpuesto.
if (cfg.og && !only.length) {
  const f = cfg.fotos.find((x) => x.id === cfg.og.foto);
  const src = await load(f);
  const box = cropBox(src.w, src.h, [1200, 630], cfg.og.focal, f.trim);
  const nombre = `${cfg.og.seccion}-${cfg.og.sujeto}-${cfg.og.momento}-01`;
  const ow = Math.min(1200, box.width);
  const jpg = await sharp(src.buf).extract(box).resize(ow, Math.round((ow * 630) / 1200), { kernel: "lanczos3" })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();
  const meta = await sharp(jpg).metadata();
  writeFileSync(join(OUT, `${nombre}-w${meta.width}.jpg`), jpg);
  const base = manifest.find((m) => m.id === f.id);
  manifest.push({
    id: f.id, original: f.original, nombre, seccion: "og", ranuras: ["og.default"], momento: cfg.og.momento, focal: cfg.og.focal,
    dimensionesOriginal: { w: src.w, h: src.h }, recorte: { ratio: [1200, 630], w: box.width, h: box.height },
    anchosGenerados: [meta.width], jpeg: { width: meta.width, height: meta.height }, lqip: null, alt: f.alt,
    estado: base?.estado ?? "ok", pendientes: base?.pendientes ?? [], personas: f.personas, calidadAvif: null, pesoAvif1440: null, nota: "Open Graph, JPEG.",
  });
  console.log(`og ${nombre} ${meta.width}x${meta.height} ${Math.round(jpg.length / 1024)}KB`);
}

if (!only.length) {
  mkdirSync("src/data", { recursive: true });
  writeFileSync("src/data/photos.manifest.json", JSON.stringify(manifest, null, 1) + "\n");
  writeFileSync("src/data/photos.slots.json", JSON.stringify(cfg.slots, null, 1) + "\n");
}
rmSync(WORK, { recursive: true, force: true });
const c = (s) => manifest.filter((m) => m.estado.startsWith(s)).length;
console.log(`\nok: ${c("ok")} | provisorias: ${c("provisoria")} | bloqueadas: ${c("bloqueada")}`);
