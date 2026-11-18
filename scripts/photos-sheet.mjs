// photos:sheet: hojas de contacto para revisar encuadres (no es parte del build del sitio).
//  1. docs/fotos/hoja-ranuras-N.jpg: cada ranura con foto, a 360, 390, 412, 768 y 1280 px, tal como se ve (recorte que
//     corresponde al breakpoint, caja del contenedor, object-position) con el sujeto marcado en lamparita.
//  2. docs/fotos/alternativas-ceremonia-fiesta.jpg: las opciones para Ceremonia y Fiesta lado a lado (escritorio y mobile).
// Se generan desde los originales con la misma geometría que photos:build (scripts/lib/photos-crop.mjs).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { VIEWPORTS, aspectAt, cropBox, normSlot, subjectPx, usesMobile, visibleWindow } from "./lib/photos-crop.mjs";

const cfg = JSON.parse(readFileSync("photos.config.json", "utf8"));
const OUT = "docs/fotos";
mkdirSync(OUT, { recursive: true });
mkdirSync(".photos-work", { recursive: true });
const esc = (t) => String(t).replace(/[<>&"]/g, "");

const cache = new Map();
async function load(id) {
  if (cache.has(id)) return cache.get(id);
  const f = cfg.fotos.find((x) => x.id === id);
  let file = join(cfg.fuente, f.original);
  if (/\.hei[cf]$/i.test(file)) {
    const mid = `.photos-work/${id}.png`;
    if (!existsSync(mid)) execFileSync("python", ["-I", "scripts/heic-to-png.py", file, mid]);
    file = mid;
  }
  const buf = await sharp(file, { failOn: "none" }).rotate().withIccProfile("srgb").png({ compressionLevel: 1 }).toBuffer();
  const m = await sharp(buf).metadata();
  const r = { f, buf, w: m.width, h: m.height };
  cache.set(id, r);
  return r;
}

/** Celda: lo que se ve en un contenedor de relación `aspect` a partir de `crop`, con el sujeto marcado. */
async function cell(photo, crop, aspect, pos, zoom, subject, H) {
  const win = visibleWindow(crop, aspect, pos, zoom);
  const ex = { left: Math.max(0, Math.round(win.x0)), top: Math.max(0, Math.round(win.y0)) };
  ex.width = Math.min(photo.w - ex.left, Math.round(win.x1 - win.x0));
  ex.height = Math.min(photo.h - ex.top, Math.round(win.y1 - win.y0));
  const W = Math.round(H * aspect);
  const img = await sharp(photo.buf).extract(ex).resize(W, H, { fit: "fill" }).jpeg({ quality: 82 }).toBuffer();
  if (!subject) return { img, W };
  const sp = subjectPx(subject, photo.w, photo.h);
  const sx = W / ex.width;
  const sy = H / ex.height;
  const x = (sp.x0 - ex.left) * sx;
  const y = (sp.y0 - ex.top) * sy;
  const w = (sp.x1 - sp.x0) * sx;
  const h = (sp.y1 - sp.y0) * sy;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#ffb347" stroke-width="3" stroke-dasharray="8 5"/></svg>`;
  return { img: await sharp(img).composite([{ input: Buffer.from(svg) }]).jpeg({ quality: 82 }).toBuffer(), W };
}
const label = (text, w, h = 22, size = 14, fg = "#fff") =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><text x="4" y="${h - 6}" font-size="${size}" font-family="Arial" fill="${fg}">${esc(text)}</text></svg>`);

// ---------- 1. Hoja de ranuras ----------
async function hojaRanuras() {
  const H = 190;
  const GAP = 10;
  const LAB = 170;
  const slots = Object.entries(cfg.slots).map(([k, v]) => [k, normSlot(v)]);
  const rows = [];
  for (const [name, slot] of slots) {
    const photo = await load(slot.foto);
    const f = photo.f;
    const base = cropBox(photo.w, photo.h, f.ratio, f.focal, f.trim);
    const mobBox = slot.mobileCrop ? cropBox(photo.w, photo.h, slot.mobileCrop.aspect, slot.mobileCrop.focal, f.trim) : null;
    const cells = [];
    for (const vw of VIEWPORTS) {
      const mob = usesMobile(slot, vw);
      const crop = mob ? mobBox : base;
      const pos = mob ? [0.5, 0.5] : (slot.focal ?? [50, 50]).map((v) => v / 100);
      const sub = (mob && slot.mobileSubject) || slot.subject || f.subject;
      const c = await cell(photo, crop, aspectAt(slot, vw), pos, vw >= 1024 ? slot.zoom ?? 1 : 1, sub, H);
      cells.push({ vw, mob, ...c });
    }
    rows.push({ name, id: slot.foto, sujeto: f.sujeto, cells });
  }
  const per = 9;
  for (let p = 0; p * per < rows.length; p++) {
    const part = rows.slice(p * per, p * per + per);
    const width = LAB + Math.max(...part.map((r) => r.cells.reduce((a, c) => a + c.W + GAP, 0)));
    const height = part.length * (H + 44) + 30;
    const comp = [{ input: label("Ranura por breakpoint (360, 390, 412, 768, 1280 px). Recuadro punteado = sujeto. M = recorte mobile propio.", width, 24, 15, "#ffb347"), left: 0, top: 0 }];
    part.forEach((r, i) => {
      const top = 30 + i * (H + 44);
      comp.push({ input: label(r.name, LAB, 22, 15), left: 4, top: top + 20 }, { input: label(`${r.id} ${r.sujeto ?? ""}`.slice(0, 26), LAB, 20, 12, "#aaa"), left: 4, top: top + 42 });
      let x = LAB;
      for (const c of r.cells) {
        comp.push({ input: c.img, left: x, top: top + 22 }, { input: label(`${c.vw}${c.mob ? " M" : ""}`, c.W, 20, 13, "#8f8"), left: x, top });
        x += c.W + GAP;
      }
    });
    const file = `${OUT}/hoja-ranuras-${p + 1}.jpg`;
    await sharp({ create: { width, height, channels: 3, background: "#151d18" } }).composite(comp).jpeg({ quality: 82 }).toFile(file);
    console.log(file, `${width}x${height}`);
  }
}

// ---------- 2. Alternativas Ceremonia y Fiesta ----------
// base: recorte apaisado para escritorio; mob: recorte mobile 4:5. pos: object-position (%) del recorte base.
const OPCIONES = [
  {
    tit: "CEREMONIA",
    texto: "Contamos con un espacio para ceremonias. Al recorrerlo vas a poder conversar sobre el armado, la circulación de invitados...",
    ops: [
      { id: "F046", nombre: "ANTES: F046 (palmera), como estaba", antes: true, base: { ratio: [7, 4], focal: { x: 0.5, y: 0.39 } }, mob: { aspect: [4, 5], focal: { x: 0.5, y: 0.39 } }, pos: [50, 50] },
      { id: "F057", nombre: "ELEGIDA A: F057, pasillo de flores con invitados", base: { ratio: [3, 2], focal: { x: 0.5, y: 0.58 } }, mob: { aspect: [4, 5], focal: { x: 0.5, y: 0.6 } }, pos: [50, 70], sujeto: { x0: 0.06, y0: 0.46, x1: 0.94, y1: 0.74 } },
      { id: "F046", nombre: "B: F046 reencuadrada (invitados, guirnaldas, palmera)", base: { ratio: [1, 1], focal: { x: 0.5, y: 0.68 } }, mob: { aspect: [4, 5], focal: { x: 0.5, y: 0.66 } }, pos: [50, 50] },
    ],
  },
  {
    tit: "FIESTA",
    texto: "El parque aporta verde y aire; el interior permite dar continuidad a la celebración. Son 320 m² cubiertos, ampliables a 520 m².",
    ops: [
      { id: "F049", nombre: "ANTES: F049 (árbol con guirnaldas)", antes: true, base: { ratio: [4, 5], focal: { x: 0.5, y: 0.55 } }, mob: { aspect: [4, 5], focal: { x: 0.5, y: 0.55 } }, pos: [50, 70] },
      { id: "F029", nombre: "ELEGIDA A: F029, galpón de noche con luces e invitados", base: { ratio: [2, 1], focal: { x: 0.5, y: 0.6 } }, mob: { aspect: [4, 5], focal: { x: 0.5, y: 0.6 } }, pos: [50, 50], sujeto: { x0: 0.1, y0: 0.44, x1: 0.9, y1: 0.72 } },
      { id: "F009", nombre: "B: F009, galpón con bolas espejadas y luces, sin gente", base: { ratio: [2, 1], focal: { x: 0.5, y: 0.2 } }, mob: { aspect: [4, 5], focal: { x: 0.5, y: 0.4 } }, pos: [50, 50] },
    ],
  },
];

async function alternativas() {
  const H = 230;
  const GAP = 12;
  const LAB = 320;
  const comp = [];
  let top = 0;
  const colW = [Math.round(H * 1.97), Math.round(H * 0.83), Math.round(H * 0.98)];
  const width = LAB + colW.reduce((a, b) => a + b + GAP, 0);
  for (const grupo of OPCIONES) {
    comp.push({ input: label(`${grupo.tit}: ${grupo.texto}`.slice(0, 200), width, 28, 16, "#ffb347"), left: 0, top });
    top += 32;
    comp.push({ input: label("escritorio 1280 px", colW[0], 18, 12, "#8f8"), left: LAB, top }, { input: label("mobile 390 px", colW[1], 18, 12, "#8f8"), left: LAB + colW[0] + GAP, top }, { input: label("mobile 360 px", colW[2], 18, 12, "#8f8"), left: LAB + colW[0] + colW[1] + 2 * GAP, top });
    top += 20;
    for (const o of grupo.ops) {
      const ph = await load(o.id);
      const f = ph.f;
      const base = cropBox(ph.w, ph.h, o.base.ratio, o.base.focal, f.trim);
      const mob = cropBox(ph.w, ph.h, o.mob.aspect, o.mob.focal, f.trim);
      const cs = [
        await cell(ph, base, 1.97, o.pos.map((v) => v / 100), 1.12, o.sujeto ?? null, H),
        await cell(ph, mob, 0.83, [0.5, 0.5], 1, null, H),
        await cell(ph, mob, 0.98, [0.5, 0.5], 1, null, H),
      ];
      const flags = [
        f.dudas?.procedencia && !f.confirmado?.procedencia ? "procedencia sin confirmar" : "",
        f.dudas?.rostros && !f.confirmado?.rostros ? "rostros sin permiso confirmado" : "",
        Math.max(base.width, base.height) < 2000 ? `resolución baja (${base.width}x${base.height})` : `resolución ok (original ${ph.w}x${ph.h})`,
      ].filter(Boolean);
      const lines = [o.nombre, f.alt.slice(0, 48), f.alt.slice(48, 96), ...flags];
      lines.forEach((t, i) => comp.push({ input: label(t, LAB, 18, i === 0 ? 14 : 12, i === 0 ? (o.antes ? "#f88" : "#fff") : "#bbb"), left: 4, top: top + i * 19 }));
      let x = LAB;
      cs.forEach((c, i) => {
        comp.push({ input: c.img, left: x, top });
        x += colW[i] + GAP;
      });
      top += H + 14;
    }
    top += 14;
  }
  const file = `${OUT}/alternativas-ceremonia-fiesta.jpg`;
  await sharp({ create: { width, height: top, channels: 3, background: "#151d18" } }).composite(comp).jpeg({ quality: 85 }).toFile(file);
  console.log(file, `${width}x${top}`);
}

await hojaRanuras();
await alternativas();
