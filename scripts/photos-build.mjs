// photos:build: procesa las fotos de photos.config.json y escribe public/photos/ y src/data/photos.manifest.json.
// Solo recorta, redimensiona, convierte y comprime. No retoca, no agranda, no publica metadatos.
// Reemplazar un original: copiarlo con el mismo nombre en la carpeta `fuente` y correr `npm run photos:build`.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { VIEWPORTS, aspectAt, cropBox, missing, normSlot, subjectPx, usesMobile, visibleWindow } from "./lib/photos-crop.mjs";

const cfg = JSON.parse(readFileSync("photos.config.json", "utf8"));
const OUT = cfg.salida;
const WORK = ".photos-work";
const WIDTHS = [640, 960, 1440, 2000];
const WIDTHS_MOBILE = [480, 720, 960, 1440];
const errores = [];
const slotsNorm = Object.fromEntries(Object.entries(cfg.slots).map(([k, v]) => [k, normSlot(v)]));
const HERO_SECTIONS = new Set(["inicio-hero", "casamientos-hero"]);
const only = process.argv.slice(2).filter((a) => /^F\d{3}$/.test(a));

if (!only.length) rmSync(OUT, { recursive: true, force: true });
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

const enc = {
  avif: (s, q) => s.avif({ quality: q, effort: 4 }),
  jpg: (s, q) => s.jpeg({ quality: q, progressive: true, mozjpeg: true }),
};

const counters = new Map();
const nameFor = (f) => {
  const base = `${f.seccion}-${f.sujeto}-${f.momento}`;
  const n = (counters.get(base) ?? 0) + 1;
  counters.set(base, n);
  return `${base}-${String(n).padStart(2, "0")}`;
};

/** Motivos por los que una foto sigue provisoria. La resolucion se mide sobre el recorte que se publica. */
function pendientesDe(f, box) {
  const pend = [];
  if (f.dudas?.procedencia && !f.confirmado?.procedencia) pend.push("procedencia");
  if (f.dudas?.rostros && !f.confirmado?.rostros) pend.push("rostros");
  if (Math.max(box.width, box.height) < 2000) pend.push("resolucion");
  return pend;
}

/** El sujeto (fracciones del original) tiene que quedar entero dentro del recorte base de la foto. */
function checkSubjectBase(f, box, W, H) {
  if (!f.subject) return errores.push(`${f.id}: falta "subject" (caja del sujeto principal, fracciones 0 a 1 del original)`);
  const m = missing({ x0: box.left, y0: box.top, x1: box.left + box.width, y1: box.top + box.height }, subjectPx(f.subject, W, H));
  if (m.length) errores.push(`${f.id}: el recorte base ${f.ratio.join(":")} corta el sujeto (le falta: ${m.join(", ")})`);
}

/** Lo que se ve de la foto en cada ranura y cada breakpoint de revisión debe contener el sujeto entero. */
function checkSlots(f, baseBox, mobBoxes, W, H) {
  for (const [name, slot] of Object.entries(slotsNorm)) {
    if (slot.foto !== f.id) continue;
    const fallos = new Map();
    for (const vw of VIEWPORTS) {
      const mob = usesMobile(slot, vw);
      const crop = mob ? mobBoxes[name] : baseBox;
      const pos = mob ? [0.5, 0.5] : (slot.focal ?? [50, 50]).map((v) => v / 100);
      const sub = (mob && slot.mobileSubject) || slot.subject || f.subject;
      const zoom = vw >= 1024 ? slot.zoom ?? 1 : 1;
      const win = visibleWindow(crop, aspectAt(slot, vw), pos, zoom);
      const m = missing(win, subjectPx(sub, W, H));
      if (m.length) {
        const k = `${mob ? "recorte mobile" : "recorte base"}: le falta ${m.join(", ")}`;
        fallos.set(k, [...(fallos.get(k) ?? []), vw]);
      }
    }
    for (const [k, vws] of fallos) errores.push(`${name} (${f.id}) a ${vws.join("/")} px, ${k}`);
  }
}

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
  // Fotos de reserva (sin ranura): no se generan salvo que se pidan por ID (`photos:build -- F046`).
  const tieneRanura = Object.values(cfg.slots).some((s) => s.foto === f.id);
  if (!only.length && !tieneRanura) {
    const m = await sharp(join(cfg.fuente, f.original), { failOn: "none" }).metadata();
    const box = cropBox(m.width, m.height, f.ratio, f.focal, f.trim);
    const pend = pendientesDe(f, box);
    checkSubjectBase(f, box, m.width, m.height);
    manifest.push({
      id: f.id, original: f.original, nombre, seccion: f.seccion, ranuras: [], momento: f.momento, focal: f.focal, generada: false,
      dimensionesOriginal: { w: m.width, h: m.height }, recorte: { ratio: f.ratio, w: box.width, h: box.height },
      anchosGenerados: [], lqip: null, alt: f.alt, estado: pend.length ? `provisoria-${pend[0]}` : "ok", pendientes: pend,
      personas: f.personas, nota: `Reserva: sin ranura, no se genera. ${f.nota}`.trim(),
    });
    console.log(`${f.id} ${nombre} reserva (sin generar)`);
    continue;
  }
  const src = await load(f);
  const box = cropBox(src.w, src.h, f.ratio, f.focal, f.trim);
  const mobBoxes = {};
  for (const [name, slot] of Object.entries(slotsNorm)) if (slot.foto === f.id && slot.mobileCrop) mobBoxes[name] = cropBox(src.w, src.h, slot.mobileCrop.aspect, slot.mobileCrop.focal, f.trim);
  checkSubjectBase(f, box, src.w, src.h);
  checkSlots(f, box, mobBoxes, src.w, src.h);
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
    writeFileSync(join(OUT, `${nombre}-w${w}.avif`), avif);
    sizes[w] = { avif: avif.length };
  }
  const jpg = await enc.jpg(sharp(master).resize(wRef, h(wRef), { kernel: "lanczos3" }), 80).toBuffer();
  writeFileSync(join(OUT, `${nombre}-w${wRef}.jpg`), jpg);
  // Variantes mobile (dirección de arte): recorte propio por ranura, solo AVIF.
  const mobile = {};
  for (const [name, mb] of Object.entries(mobBoxes)) {
    const mc = slotsNorm[name].mobileCrop;
    const mm = await sharp(src.buf).extract(mb).png({ compressionLevel: 1 }).toBuffer();
    const mw = WIDTHS_MOBILE.filter((w) => w <= mb.width);
    if (!mw.includes(mb.width) && mb.width < 2000 && mb.width > (mw.at(-1) ?? 0)) mw.push(mb.width);
    const ref = Math.max(...mw.filter((w) => w <= 960));
    const mh = (w) => Math.round((w * mb.height) / mb.width);
    let mq = 55;
    for (;;) {
      const sz = (await enc.avif(sharp(mm).resize(ref, mh(ref)), mq).toBuffer()).length;
      if (sz <= 90 * 1024 || mq <= 30) break;
      mq -= 5;
    }
    const mname = `${nombre}-mob-${name.replace(/./g, "-")}`;
    for (const w of mw) writeFileSync(join(OUT, `${mname}-w${w}.avif`), await enc.avif(sharp(mm).resize(w, mh(w), { kernel: "lanczos3" }), mq).toBuffer());
    mobile[name] = { nombre: mname, ratio: mc.aspect, maxWidth: mc.maxWidth, box: mb, widths: mw, calidadAvif: mq };
    console.log(`   mobile ${name} ${mc.aspect.join(":")} ${mw.join("/")} q${mq}`);
  }
  const lqipBuf = await sharp(master).resize(24).jpeg({ quality: 45 }).toBuffer();
  const orig = { w: src.w, h: src.h };
  const pend = pendientesDe(f, box);
  const nota = [f.nota, q < 50 ? `AVIF a calidad ${q} para entrar en ${budget} KB.` : ""].filter(Boolean).join(" ");
  manifest.push({
    id: f.id, original: f.original, nombre, seccion: f.seccion, ranuras: Object.keys(cfg.slots).filter((s) => cfg.slots[s].foto === f.id), momento: f.momento, focal: f.focal,
    dimensionesOriginal: orig, recorte: { ratio: f.ratio, w: box.width, h: box.height, left: box.left, top: box.top }, subject: f.subject, mobile,
    generada: true, anchosGenerados: widths, jpeg: { width: wRef, height: h(wRef) }, lqip: `data:image/jpeg;base64,${lqipBuf.toString("base64")}`,
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

if (errores.length) {
  console.error("\nphotos:build FALLA: el recorte no contiene al sujeto entero.\n" + errores.map((e) => "  - " + e).join("\n"));
  rmSync(WORK, { recursive: true, force: true });
  process.exit(1);
}

if (only.length) {
  // Modo parcial (npm run photos:build -- F046): rehace solo esas fotos y mezcla el manifiesto existente.
  const old = JSON.parse(readFileSync("src/data/photos.manifest.json", "utf8"));
  const fresh = new Map(manifest.filter((m) => only.includes(m.id) && m.seccion !== "og").map((m) => [m.id, m]));
  const merged = old.map((m) => (m.seccion !== "og" && fresh.has(m.id) ? fresh.get(m.id) : m));
  writeFileSync("src/data/photos.manifest.json", JSON.stringify(merged, null, 1) + "\n");
  writeFileSync("src/data/photos.slots.json", JSON.stringify(slotsNorm, null, 1) + "\n");
} else {
  mkdirSync("src/data", { recursive: true });
  writeFileSync("src/data/photos.manifest.json", JSON.stringify(manifest, null, 1) + "\n");
  writeFileSync("src/data/photos.slots.json", JSON.stringify(slotsNorm, null, 1) + "\n");
}
rmSync(WORK, { recursive: true, force: true });
const c = (s) => manifest.filter((m) => m.estado.startsWith(s)).length;
console.log(`\nok: ${c("ok")} | provisorias: ${c("provisoria")} | bloqueadas: ${c("bloqueada")}`);
