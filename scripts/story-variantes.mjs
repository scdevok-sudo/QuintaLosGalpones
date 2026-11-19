// story:variantes: capturas a 1920x1080 de las 4 escenas del recorrido en tres variantes de escritorio, para elegir:
//   cover   foto a pantalla completa (recorte 2:1, ampliada para llenar el escenario)
//   split   vertical a la altura de la escena, texto a un lado (la actual)
//   ambient vertical nítida centrada, con los costados rellenos con un desenfoque tintado de la misma foto
// Cada variante se arma en la página real con el recorte que le corresponde (generado con sharp desde el original, sin
// mejoras, solo para comparar). Uso: npm run preview (otra terminal) y `node scripts/story-variantes.mjs`.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { chromium } from "playwright";
import { cropBox } from "./lib/photos-crop.mjs";

const base = process.env.BASE_URL || "http://localhost:4173";
const cfg = JSON.parse(readFileSync("photos.config.json", "utf8"));
const OUT = "docs/fotos/escritorio";
mkdirSync(OUT, { recursive: true });
mkdirSync(".photos-work", { recursive: true });
const SLOTS = ["story.llegada", "story.ceremonia", "story.fiesta", "story.noche"];

async function original(id) {
  const f = cfg.fotos.find((x) => x.id === id);
  let file = join(cfg.fuente, f.original);
  if (/\.hei[cf]$/i.test(file)) {
    const mid = `.photos-work/${id}.png`;
    if (!existsSync(mid)) execFileSync("python", ["-I", "scripts/heic-to-png.py", file, mid]);
    file = mid;
  }
  const buf = await sharp(file, { failOn: "none" }).rotate().withIccProfile("srgb").png({ compressionLevel: 1 }).toBuffer();
  const m = await sharp(buf).metadata();
  return { f, buf, w: m.width, h: m.height };
}

// Recortes de cada escena: cover (aspect y focal de `desktop.cover`) y vertical (aspect y focal de `desktop`).
const crops = {};
for (const name of SLOTS) {
  const s = cfg.slots[name];
  const o = await original(s.foto);
  const mk = async (aspect, focal) => {
    const b = cropBox(o.w, o.h, aspect, focal, o.f.trim);
    const r = await sharp(o.buf).extract(b).resize({ width: Math.min(b.width, 2000) }).jpeg({ quality: 90 }).toBuffer();
    return `data:image/jpeg;base64,${r.toString("base64")}`;
  };
  crops[name] = {
    cover: await mk(s.desktop.cover.aspect, s.desktop.cover.focal),
    vertical: await mk(s.desktop.aspect, s.desktop.focal),
    ar: s.desktop.aspect.join(" / "),
    ancho: o.w,
  };
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
const page = await ctx.newPage();
await page.goto(base + "/", { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2000);
const info = await page.evaluate(() => {
  const s = document.querySelector(".story");
  return { top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight, stage: s.firstElementChild.offsetHeight };
});
const shots = [];
for (const variante of ["cover", "split", "ambient"]) {
  for (const [i, p] of [0.1, 0.35, 0.6, 0.9].entries()) {
    await page.evaluate((y) => scrollTo(0, y), info.top + p * (info.h - info.stage));
    await page.waitForTimeout(1500);
    await page.evaluate(
      ([variante, crops, slots, i]) => {
        const art = document.querySelectorAll(".story-scene")[i];
        const c = crops[slots[i]];
        const ph = art.querySelector(".ph");
        art.querySelectorAll("source").forEach((s) => s.remove());
        const img = art.querySelector("img");
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.src = variante === "cover" ? c.cover : c.vertical;
        if (variante === "cover") {
          art.removeAttribute("data-layout");
          ph.removeAttribute("data-art");
          ph.removeAttribute("data-cap");
          ph.removeAttribute("data-layout");
          ph.removeAttribute("data-wide");
        } else {
          ph.setAttribute("data-layout", variante);
          art.setAttribute("data-layout", variante);
          art.style.setProperty("--split-ar", c.ar);
          ph.style.setProperty("--ar-x", c.ar);
        }
      },
      [variante, crops, SLOTS, i],
    );
    await page.waitForTimeout(500);
    const file = `${OUT}/recorrido-1920-${variante}-escena${i + 1}.jpg`;
    await page.screenshot({ path: file, type: "jpeg", quality: 85 });
    shots.push({ variante, i, file });
    console.log(file);
  }
}
await browser.close();

// Hoja comparativa: una fila por escena, una columna por variante.
const W = 640;
const H = 360;
const cells = [];
for (let i = 0; i < 4; i++)
  for (const [j, v] of ["cover", "split", "ambient"].entries()) {
    const f = shots.find((x) => x.variante === v && x.i === i).file;
    const b = await sharp(f).resize(W, H).jpeg({ quality: 82 }).toBuffer();
    const lab = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="22"><rect width="${W}" height="22" fill="#000"/><text x="6" y="16" font-size="14" font-family="Arial" fill="#ffb347">${v.toUpperCase()}  |  escena ${i + 1}</text></svg>`);
    cells.push({ input: b, left: j * (W + 8), top: i * (H + 30) + 22 }, { input: lab, left: j * (W + 8), top: i * (H + 30) });
  }
await sharp({ create: { width: 3 * W + 16, height: 4 * (H + 30), channels: 3, background: "#111" } }).composite(cells).jpeg({ quality: 85 }).toFile(`${OUT}/recorrido-1920-variantes.jpg`);
console.log(`${OUT}/recorrido-1920-variantes.jpg`);
