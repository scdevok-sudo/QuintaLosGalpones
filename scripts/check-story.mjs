// check:story: el recorrido a pantalla completa en escritorio (npm run preview en otra terminal).
// Para cada escena, a 1920x1080 y 1280x720 y a lo largo del scroll (parallax incluido):
//   1. la tarjeta de texto cumple contraste AA (4,5:1 texto normal, 3:1 texto grande) contra su fondo;
//   2. la tarjeta no tapa más del 15 % de la caja del sujeto (que es generosa: incluye margen); si lo tapa, story.ts: panel: "right"
//      (PANEL=right prueba ese lado);
//   3. el sujeto queda completo dentro de la foto visible.
// Con --shots guarda las capturas de cada escena en docs/fotos/escritorio/recorrido-<ancho>-<escena>.jpg.
// Sale con error si algo falla. El sujeto sale de photos.config.json / photos.manifest.json.
import { mkdirSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4173";
const shots = process.argv.includes("--shots");
const OUT = "docs/fotos/escritorio";
if (shots) mkdirSync(OUT, { recursive: true });
const manifest = JSON.parse(readFileSync("src/data/photos.manifest.json", "utf8"));
const slotMap = JSON.parse(readFileSync("src/data/photos.slots.json", "utf8"));
const SLOTS = ["story.llegada", "story.ceremonia", "story.fiesta", "story.noche"];
const NOMBRES = ["llegada", "ceremonia", "fiesta", "noche"];
const sizes = [[1920, 1080], [1280, 720]];

/** Sujeto de la ranura expresado como fracciones del recorte de escritorio publicado. */
function sujetoEnRecorte(name) {
  const slot = slotMap[name];
  const m = manifest.find((x) => x.id === slot.foto && x.seccion !== "og");
  const art = m.art[`${name}|desktop`];
  const s = slot.subject ?? m.subject;
  const { w: W, h: H } = m.dimensionesOriginal;
  const b = art.box;
  return { x0: (s.x0 * W - b.left) / b.width, y0: (s.y0 * H - b.top) / b.height, x1: (s.x1 * W - b.left) / b.width, y1: (s.y1 * H - b.top) / b.height, ratio: b.width / b.height };
}

const fails = [];
const rows = [];
const browser = await chromium.launch();
for (const [w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const s = document.querySelector(".story");
    return { top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight, stage: s.firstElementChild.offsetHeight };
  });
  const range = info.h - info.stage;
  for (const [i, name] of SLOTS.entries()) {
    const suj = sujetoEnRecorte(name);
    // Puntos del scroll dentro de la escena: casi al inicio, medio y casi al final (el parallax mueve la foto).
    const worst = { solape: 0, fuera: 0 };
    let contrast = null;
    for (const t of [0.04, 0.5, 0.96]) {
      const p = (i + t) / SLOTS.length;
      await page.evaluate((y) => scrollTo(0, y), info.top + p * range);
      await page.waitForTimeout(t === 0.5 ? 1500 : 1100);
      if (process.env.PANEL) await page.evaluate(([idx, lado]) => document.querySelectorAll(".story-scene")[idx].setAttribute("data-panel", lado), [i, process.env.PANEL]); // prueba del otro lado
      const g = await page.evaluate(
        ([idx]) => {
          const scene = document.querySelectorAll(".story-scene")[idx];
          const ph = scene.querySelector(".ph");
          const img = scene.querySelector("img");
          const panel = scene.querySelector(".story-panel");
          const phR = ph.getBoundingClientRect(); // incluye el parallax (translate + scale)
          const pr = panel.getBoundingClientRect();
          const sc = scene.getBoundingClientRect();
          const lum = (c) => {
            const v = c.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
            return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
          };
          const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
          const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
          const bg = rgb(getComputedStyle(panel).backgroundColor);
          const items = [["h3", panel.querySelector("h3")], ["texto", panel.querySelector("p")], ["enlace", panel.querySelector("a")]].map(([n, el]) => {
            const cs = getComputedStyle(el);
            const big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700);
            return { n, ratio: +cr(rgb(cs.color), bg).toFixed(2), min: big ? 3 : 4.5 };
          });
          return { phR: { x: phR.x, y: phR.y, w: phR.width, h: phR.height }, pr: { x: pr.x, y: pr.y, w: pr.width, h: pr.height }, sc: { x: sc.x, y: sc.y, w: sc.width, h: sc.height }, bgAlpha: bg[3] ?? 1, items, natural: img.naturalWidth / img.naturalHeight };
        },
        [i],
      );
      contrast = g.items;
      // Foto dibujada con object-fit: cover dentro de .ph: recorte publicado -> pantalla.
      const k = Math.max(g.phR.w / (suj.ratio * 1000), g.phR.h / 1000);
      const dw = suj.ratio * 1000 * k;
      const dh = 1000 * k;
      const ox = g.phR.x + (g.phR.w - dw) / 2;
      const oy = g.phR.y + (g.phR.h - dh) / 2;
      const r = { x0: ox + suj.x0 * dw, y0: oy + suj.y0 * dh, x1: ox + suj.x1 * dw, y1: oy + suj.y1 * dh };
      // Parte visible: lo que entra en la escena (la foto se sale por el parallax).
      const vis = { x0: g.sc.x, y0: g.sc.y, x1: g.sc.x + g.sc.w, y1: g.sc.y + g.sc.h };
      const fuera = Math.max(0, vis.x0 - r.x0, vis.y0 - r.y0, r.x1 - vis.x1, r.y1 - vis.y1);
      const ix = Math.max(0, Math.min(r.x1, g.pr.x + g.pr.w) - Math.max(r.x0, g.pr.x));
      const iy = Math.max(0, Math.min(r.y1, g.pr.y + g.pr.h) - Math.max(r.y0, g.pr.y));
      const solape = (ix * iy) / ((r.x1 - r.x0) * (r.y1 - r.y0));
      worst.solape = Math.max(worst.solape, solape);
      worst.fuera = Math.max(worst.fuera, fuera);
      if (t === 0.5 && shots) await page.screenshot({ path: `${OUT}/recorrido-${w}-${NOMBRES[i]}.jpg`, type: "jpeg", quality: 85 });
    }
    const malContraste = contrast.filter((c) => c.ratio < c.min);
    const ok = { contraste: !malContraste.length, solape: worst.solape <= 0.15, completo: worst.fuera < 2 };
    rows.push({ w, h, escena: NOMBRES[i], contraste: contrast.map((c) => `${c.n} ${c.ratio}`).join(", "), solape: Math.round(worst.solape * 100), fuera: Math.round(worst.fuera), ok });
    if (!ok.contraste) fails.push(`${w}x${h} ${NOMBRES[i]}: contraste bajo (${malContraste.map((c) => `${c.n} ${c.ratio} < ${c.min}`).join(", ")})`);
    if (!ok.solape) fails.push(`${w}x${h} ${NOMBRES[i]}: la tarjeta tapa ${Math.round(worst.solape * 100)} % de la caja del sujeto, más del 15 % tolerado (probar panel: "right" en story.ts con PANEL=right)`);
    if (!ok.completo) fails.push(`${w}x${h} ${NOMBRES[i]}: el sujeto se sale de la escena ${Math.round(worst.fuera)} px`);
  }
  await ctx.close();
}
await browser.close();
console.log("| Tamaño | Escena | Contraste (mínimo AA) | Tarjeta sobre el sujeto | Sujeto fuera de pantalla | OK |\n|---|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.w}x${r.h} | ${r.escena} | ${r.contraste} | ${r.solape} % | ${r.fuera} px | ${Object.values(r.ok).every(Boolean) ? "sí" : "NO"} |`);
if (fails.length) {
  console.error("\ncheck:story FALLA:\n" + fails.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log("\ncheck:story OK");
