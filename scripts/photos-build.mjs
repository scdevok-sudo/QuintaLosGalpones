// photos:build: procesa las fotos de photos.config.json y escribe public/photos/ y src/data/photos.manifest.json.
// Recorta, redimensiona, convierte y comprime, y aplica la mejora técnica de Nivel A (ruido leve, enfoque suave, exposición y
// color consistentes; scripts/enhance.py). No quita ni agrega nada, no agranda, no publica metadatos y no toca los originales.
// Dirección de arte por breakpoint: mobile, desktop y wide (relación, foco, ancho máximo y layout cover | split | mosaico).
// Reemplazar un original: copiarlo con el mismo nombre en la carpeta `fuente` y correr `npm run photos:build`.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { DESKTOP_VIEWPORTS, VIEWPORTS, artAt, aspectAt, cropBox, missing, mosaicMembers, normSlot, subjectPx, usesMobile, visibleWindow } from "./lib/photos-crop.mjs";

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

const A = { sigmaMin: 1.4, hMax: 3, evMax: 0.25, wbMax: 0.04, cambioMax: 8, sharpen: { sigma: 0.7, m1: 0.4, m2: 1, x1: 2, y2: 10, y3: 20 }, ...(cfg.mejora?.nivelA ?? {}) };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const py = (...args) => JSON.parse(execFileSync("python", ["-I", "scripts/enhance.py", ...args], { encoding: "utf8", maxBuffer: 1 << 24 }));
const claseDe = (f) => (["noche", "interior"].includes(f.momento) ? "noche" : "dia");
const mediana = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];

/** Estadísticas de cada foto con ranura (ruido, luma mediana, razones de color) y el objetivo de cada clase (mediana del grupo). */
const stats = new Map();
const objetivos = {};
async function analizar() {
  const ids = new Set(
    [...Object.values(cfg.slots).flatMap((sl) => [sl.foto, ...(sl.desktop?.fotos ?? []).map((m) => m.foto)]), cfg.og?.foto].filter(Boolean),
  );
  for (const f of cfg.fotos.filter((x) => x.procesar && ids.has(x.id))) {
    const src = await load(f);
    const file = join(WORK, `${f.id}.src.png`);
    writeFileSync(file, src.buf);
    stats.set(f.id, py("analyze", file));
  }
  for (const clase of ["dia", "noche"]) {
    const g = cfg.fotos.filter((x) => stats.has(x.id) && claseDe(x) === clase).map((x) => stats.get(x.id));
    if (g.length) objetivos[clase] = { luma: mediana(g.map((x) => x.lumaMediana)), rg: mediana(g.map((x) => x.rg)), bg: mediana(g.map((x) => x.bg)) };
  }
}

/** Nivel A sobre el original completo: devuelve el PNG mejorado, su escala respecto del original y lo aplicado. */
async function mejorar(f, src) {
  const st = stats.get(f.id);
  const off = f.mejora?.nivelA === false;
  const proceso = { nivelA: { aplicado: !off, enfoque: !off ? A.sharpen : null }, nivelB: { estado: "no-generado", aplicado: false }, originalIntacto: true };
  if (!st || off) return { buf: src.buf, w: src.w, h: src.h, scale: 1, proceso };
  const ob = objetivos[claseDe(f)];
  const ev = +clamp(0.5 * Math.log2(ob.luma / st.lumaMediana), -A.evMax, A.evMax).toFixed(3);
  const g = (t, v) => +clamp(Math.sqrt(t / v), 1 - A.wbMax, 1 + A.wbMax).toFixed(4);
  const wb = [g(ob.rg, st.rg), 1, g(ob.bg, st.bg)];
  const h = st.sigma > A.sigmaMin ? +clamp(st.sigma - 1, 0.8, A.hMax).toFixed(2) : 0;
  Object.assign(proceso.nivelA, { ruidoEstimado: st.sigma, reduccionRuido: h, exposicionEV: ev, balanceColor: wb, clase: claseDe(f) });
  const nada = !h && Math.abs(ev) < 0.01 && wb.every((v) => Math.abs(v - 1) < 0.002) && src.w <= 2000;
  if (nada) return { buf: src.buf, w: src.w, h: src.h, scale: 1, proceso };
  const inF = join(WORK, `${f.id}.src.png`);
  const outF = join(WORK, `${f.id}.enh.png`);
  writeFileSync(inF, src.buf);
  const r = py("apply", inF, outF, `h=${h}`, `ev=${ev}`, `wb=${wb.join(",")}`, "maxw=2000");
  return { buf: readFileSync(outF), w: r.ancho, h: r.alto, scale: r.escala, proceso };
}

/** Recorte (caja en píxeles del original) sobre la fuente mejorada, que puede venir achicada a 2000 px de ancho. */
const extractEnh = (enh, box) => {
  const k = enh.scale;
  const left = Math.min(Math.round(box.left * k), enh.w - 1);
  const top = Math.min(Math.round(box.top * k), enh.h - 1);
  return { left, top, width: Math.min(Math.round(box.width * k), enh.w - left), height: Math.min(Math.round(box.height * k), enh.h - top) };
};

/** Cuánto cambió la mejora respecto del original (diferencia media absoluta 0..255, a 320 px): barrera contra retoques que alteren contenido. */
async function cambioMedio(srcBuf, enh, box) {
  const a = await sharp(srcBuf).extract(box).resize(320).removeAlpha().raw().toBuffer();
  const b = await sharp(enh.buf).extract(extractEnh(enh, box)).resize(320, Math.round((320 * box.height) / box.width)).removeAlpha().raw().toBuffer();
  const n = Math.min(a.length, b.length);
  let t = 0;
  for (let i = 0; i < n; i++) t += Math.abs(a[i] - b[i]);
  return +(t / n).toFixed(2);
}

/**
 * Genera las variantes AVIF de un recorte: baja la calidad hasta entrar en el presupuesto (no la resolución) y nunca agranda.
 * Achica y recién ahí enfoca suave, a la medida final de cada ancho.
 */
async function variante(enh, box, nombre, anchos, presupuestoKB, refMax) {
  const master = await sharp(enh.buf).extract(extractEnh(enh, box)).png({ compressionLevel: 1 }).toBuffer();
  const h = (w) => Math.round((w * box.height) / box.width);
  const img = (w) => {
    const r = sharp(master).resize(w, h(w), { kernel: "lanczos3" });
    return enh.proceso.nivelA.aplicado ? r.sharpen(A.sharpen) : r;
  };
  const ref = Math.max(...anchos.filter((w) => w <= refMax));
  let q = 55;
  for (;;) {
    const sz = (await enc.avif(img(ref), q).toBuffer()).length;
    if (sz <= presupuestoKB * 1024 || q <= 30) break;
    q -= 5;
  }
  const pesos = {};
  for (const w of anchos) {
    const b = await enc.avif(img(w), q).toBuffer();
    writeFileSync(join(OUT, `${nombre}-w${w}.avif`), b);
    pesos[w] = b.length;
  }
  return { q, ref, pesos };
}

/** Anchos a generar para un recorte: los de la lista que entran, más el ancho del recorte si es menor que 2000 (nunca agranda). */
const anchosPara = (lista, bw) => {
  const w = lista.filter((x) => x <= bw);
  if (bw < 2000 && !w.includes(bw)) w.push(bw);
  return w;
};

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

/** Recortes propios de escritorio (desktop / wide) de una foto: los de sus ranuras y los que le toca como parte de un mosaico. */
function artsDe(f) {
  const out = [];
  for (const [name, slot] of Object.entries(slotsNorm)) {
    for (const bp of ["desktop", "wide"]) {
      const art = bp === "desktop" ? slot.desktopCrop : cfg.slots[name].wide ? slot.wideCrop : null;
      if (!art) continue;
      // Wide igual que desktop: se reutiliza el recorte de desktop.
      if (bp === "wide" && JSON.stringify([art.aspect, art.focal, art.fotos]) === JSON.stringify([slot.desktopCrop?.aspect, slot.desktopCrop?.focal, slot.desktopCrop?.fotos])) continue;
      const miembros = art.layout === "mosaico" ? mosaicMembers(slot, art) : [{ foto: slot.foto, aspect: art.aspect, focal: art.focal, i: 0 }];
      for (const m of miembros) if (m.foto === f.id) out.push({ key: `${name}|${bp}${m.i ? "#" + m.i : ""}`, slot: name, bp, art, m });
    }
  }
  return out;
}
const usadaPorMosaico = (id) => Object.values(slotsNorm).some((sl) => [sl.desktopCrop, sl.wideCrop].some((a) => a?.layout === "mosaico" && (a.fotos ?? []).some((m) => m.foto === id)));
const wideDistinto = (name) => {
  const sl = slotsNorm[name];
  return Boolean(sl.wideCrop) && JSON.stringify([sl.wideCrop.aspect, sl.wideCrop.focal, sl.wideCrop.fotos]) !== JSON.stringify([sl.desktopCrop?.aspect, sl.desktopCrop?.focal, sl.desktopCrop?.fotos]);
};
/** Clave del recorte de escritorio que se muestra en una ranura a un ancho de ventana (wide reutiliza desktop si es igual). */
const artKey = (name, art) => (art.key === "wide" && wideDistinto(name) ? `${name}|wide` : `${name}|desktop`);

/** El recorte propio de escritorio tiene que contener el sujeto entero a 1280, 1440 y 1920 px (se muestra entero). */
function checkArt(f, a, box, W, H) {
  const slot = slotsNorm[a.slot];
  const sub = (!a.m.i && slot.subject) || f.subject;
  if (!sub) return errores.push(`${f.id}: falta "subject"`);
  const vws = DESKTOP_VIEWPORTS.filter((vw) => {
    const k = artAt(slot, vw);
    return k && artKey(a.slot, k) === `${a.slot}|${a.bp}`;
  });
  const m = missing({ x0: box.left, y0: box.top, x1: box.left + box.width, y1: box.top + box.height }, subjectPx(sub, W, H));
  if (m.length) errores.push(`${a.slot} (${f.id}) a ${vws.join("/")} px, recorte ${a.bp} ${a.art.layout} ${a.m.aspect.join(":")}: le falta ${m.join(", ")}`);
  if (a.art.maxWidth && box.width < 2000 && a.art.maxWidth > box.width) errores.push(`${a.slot} (${f.id}): maxWidth ${a.art.maxWidth} px agranda el recorte de ${box.width} px (más de 1:1)`);
}

/** Lo que se ve de la foto en cada ranura y cada breakpoint de revisión debe contener el sujeto entero. */
function checkSlots(f, baseBox, mobBoxes, artBoxes, W, H) {
  for (const [name, slot] of Object.entries(slotsNorm)) {
    if (slot.foto !== f.id) continue;
    const fallos = new Map();
    for (const vw of VIEWPORTS) {
      const mob = usesMobile(slot, vw);
      const art = artAt(slot, vw);
      const crop = mob ? mobBoxes[name] : art ? artBoxes[artKey(name, art)] : baseBox;
      // Un recorte propio (mobile o de escritorio) se muestra entero; el base se encuadra con el foco de la ranura.
      const own = mob || art;
      const pos = own ? [0.5, 0.5] : (slot.focal ?? [50, 50]).map((v) => v / 100);
      const sub = (mob && slot.mobileSubject) || slot.subject || f.subject;
      const zoom = vw >= 1024 && (!art || art.layout === "cover") ? slot.zoom ?? 1 : 1;
      const win = visibleWindow(crop, aspectAt(slot, vw), pos, zoom);
      const m = missing(win, subjectPx(sub, W, H));
      if (m.length) {
        const k = `${mob ? "recorte mobile" : art ? `recorte ${art.key} ${art.layout}` : "recorte base"}: le falta ${m.join(", ")}`;
        fallos.set(k, [...(fallos.get(k) ?? []), vw]);
      }
    }
    for (const [k, vws] of fallos) errores.push(`${name} (${f.id}) a ${vws.join("/")} px, ${k}`);
  }
}

await analizar();

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
  const tieneRanura = Object.values(cfg.slots).some((s) => s.foto === f.id) || usadaPorMosaico(f.id);
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
  const enh = await mejorar(f, src);
  const box = cropBox(src.w, src.h, f.ratio, f.focal, f.trim);
  const mobBoxes = {};
  for (const [name, slot] of Object.entries(slotsNorm)) if (slot.foto === f.id && slot.mobileCrop) mobBoxes[name] = cropBox(src.w, src.h, slot.mobileCrop.aspect, slot.mobileCrop.focal, f.trim);
  const arts = artsDe(f);
  const artBoxes = {};
  for (const a of arts) artBoxes[a.key] = cropBox(src.w, src.h, a.m.aspect, a.m.focal, f.trim);
  checkSubjectBase(f, box, src.w, src.h);
  for (const a of arts) checkArt(f, a, artBoxes[a.key], src.w, src.h);
  checkSlots(f, box, mobBoxes, artBoxes, src.w, src.h);
  // El texto de ranura que usa la foto como base (sin recorte propio de escritorio) conserva el recorte base.
  const cambio = await cambioMedio(src.buf, enh, box);
  if (cambio > A.cambioMax) errores.push(`${f.id}: la mejora cambió la foto demasiado (diferencia media ${cambio} de 255, máximo ${A.cambioMax})`);
  enh.proceso.nivelA.cambioMedio = cambio;
  const widths = anchosPara(WIDTHS, box.width);
  const wRef = Math.max(...widths.filter((w) => w <= 1440));
  const budget = HERO_SECTIONS.has(f.seccion) ? 200 : 120;
  const h = (w) => Math.round((w * box.height) / box.width);
  const base = await variante(enh, box, nombre, widths, budget, 1440);
  const q = base.q;
  const sizes = Object.fromEntries(Object.entries(base.pesos).map(([w, n]) => [w, { avif: n }]));
  const master = await sharp(enh.buf).extract(extractEnh(enh, box)).png({ compressionLevel: 1 }).toBuffer();
  const jpg = await enc.jpg(sharp(master).resize(wRef, h(wRef), { kernel: "lanczos3" }).sharpen(enh.proceso.nivelA.aplicado ? A.sharpen : 0.0001), 80).toBuffer();
  writeFileSync(join(OUT, `${nombre}-w${wRef}.jpg`), jpg);
  // Variantes mobile (dirección de arte): recorte propio por ranura, solo AVIF.
  const mobile = {};
  for (const [name, mb] of Object.entries(mobBoxes)) {
    const mc = slotsNorm[name].mobileCrop;
    const mw = anchosPara(WIDTHS_MOBILE, mb.width);
    const mname = `${nombre}-mob-${name.replace(/\W+/g, "-")}`;
    const v = await variante(enh, mb, mname, mw, 90, 960);
    mobile[name] = { nombre: mname, ratio: mc.aspect, maxWidth: mc.maxWidth, box: mb, widths: mw, calidadAvif: v.q };
    console.log(`   mobile ${name} ${mc.aspect.join(":")} ${mw.join("/")} q${v.q}`);
  }
  // Variantes de escritorio (desktop y wide): recorte, relación y layout propios por ranura; solo AVIF.
  const art = {};
  const hechas = new Map(); // recortes idénticos entre ranuras comparten archivos
  for (const a of arts) {
    const ab = artBoxes[a.key];
    const aw = anchosPara(WIDTHS, ab.width);
    const hero = a.slot.endsWith(".hero");
    const idem = hechas.get(JSON.stringify([ab, hero]));
    const aname = idem?.nombre ?? `${nombre}-${a.bp === "desktop" ? "desk" : "wide"}-${a.slot.replace(/\W+/g, "-")}${a.m.i ? `-${a.m.i}` : ""}`;
    const v = idem ?? { ...(await variante(enh, ab, aname, aw, hero ? 200 : ab.width >= 2000 ? 230 : 150, hero ? 1440 : 960)), nombre: aname };
    hechas.set(JSON.stringify([ab, hero]), v);
    const tope = ab.width < 2000 ? Math.min(a.art.maxWidth ?? Infinity, ab.width) : a.art.maxWidth ?? null;
    art[a.key] = { nombre: aname, slot: a.slot, bp: a.bp, layout: a.art.layout, ratio: a.m.aspect, box: ab, widths: aw, calidadAvif: v.q, maxWidth: tope };
    console.log(`   ${a.bp} ${a.slot}${a.m.i ? "#" + a.m.i : ""} ${a.art.layout} ${a.m.aspect.join(":")} ${aw.join("/")} q${v.q} tope ${tope ?? "-"}${idem ? " (comparte archivos)" : ""}`);
  }
  const lqipBuf = await sharp(master).resize(24).jpeg({ quality: 45 }).toBuffer();
  const orig = { w: src.w, h: src.h };
  const pend = pendientesDe(f, box);
  const nota = [f.nota, q < 50 ? `AVIF a calidad ${q} para entrar en ${budget} KB.` : ""].filter(Boolean).join(" ");
  const elegibleB = ["ninguna", "sin-rostro"].includes(f.personas) && Math.max(box.width, box.height) < 2000;
  enh.proceso.nivelB = { elegible: elegibleB, estado: elegibleB ? "pendiente-de-herramienta" : "no-elegible", aplicado: false, motivo: elegibleB ? "sin rostros en primer plano y resolución menor a 2000 px" : f.personas === "rostros-sin-confirmar" ? "hay rostros" : "ya tiene resolución suficiente" };
  manifest.push({
    id: f.id, original: f.original, nombre, seccion: f.seccion, ranuras: Object.keys(cfg.slots).filter((s) => cfg.slots[s].foto === f.id), momento: f.momento, focal: f.focal,
    dimensionesOriginal: orig, recorte: { ratio: f.ratio, w: box.width, h: box.height, left: box.left, top: box.top }, subject: f.subject, mobile, art,
    maxWidth: box.width < 2000 ? box.width : null,
    generada: true, anchosGenerados: widths, jpeg: { width: wRef, height: h(wRef) }, lqip: `data:image/jpeg;base64,${lqipBuf.toString("base64")}`,
    alt: f.alt, estado: pend.length ? `provisoria-${pend[0]}` : "ok", pendientes: pend, personas: f.personas,
    calidadAvif: q, pesoAvif1440: sizes[wRef].avif, proceso: enh.proceso, nota,
  });
  console.log(`${f.id} ${nombre} ${widths.join("/")} avif@${wRef}=${Math.round(sizes[wRef].avif / 1024)}KB q${q} ${pend.length ? "provisoria-" + pend.join("+") : "ok"}  A: ruido ${enh.proceso.nivelA.reduccionRuido ?? "-"} EV ${enh.proceso.nivelA.exposicionEV ?? "-"} cambio ${cambio}`);
}

// Open Graph: JPEG 1200x630, sin texto superpuesto.
if (cfg.og && !only.length) {
  const f = cfg.fotos.find((x) => x.id === cfg.og.foto);
  const src = await load(f);
  const box = cropBox(src.w, src.h, [1200, 630], cfg.og.focal, f.trim);
  const nombre = `${cfg.og.seccion}-${cfg.og.sujeto}-${cfg.og.momento}-01`;
  const ow = Math.min(1200, box.width);
  const enhOg = await mejorar(f, src);
  const jpg = await sharp(enhOg.buf).extract(extractEnh(enhOg, box)).resize(ow, Math.round((ow * 630) / 1200), { kernel: "lanczos3" })
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
