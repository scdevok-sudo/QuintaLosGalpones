// photos:measure: mide, en el sitio servido (npm run preview), el contenedor de cada foto a 1280, 1440 y 1920 px de ancho.
// Escribe src/data/photos.render.json: lo usa photos:build para el layout "auto" (agrandado necesario a 1920 px).
// Para el recorrido mide la escena completa (pantalla completa); para el resto, la columna que contiene la foto.
// Volver a correr cuando cambie la maqueta de una página.
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4173";
const routes = ["/", "/casamientos", "/espacios", "/contacto", "/eventos-reales", "/eventos-empresariales"];
const sizes = [[1280, 800], [1440, 900], [1920, 1080]];
const out = {};
const browser = await chromium.launch();
for (const [w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ".cv{content-visibility:visible !important}" });
    await page.waitForTimeout(800);
    const items = await page.evaluate(() =>
      [...document.querySelectorAll(".ph[data-slot]")].map((ph) => {
        const scene = ph.closest(".story-scene");
        const box = (scene ?? ph.parentElement).getBoundingClientRect();
        let w = box.width;
        let h = box.height;
        if (scene) h = scene.getBoundingClientRect().height;
        return { slot: ph.dataset.slot, w: Math.round(w), h: Math.round(h), story: Boolean(scene) };
      }),
    );
    for (const it of items) (out[it.slot] ??= {})[w] = { w: it.w, h: it.h, ...(it.story ? { pantallaCompleta: true } : {}) };
  }
  await ctx.close();
}
await browser.close();
writeFileSync("src/data/photos.render.json", JSON.stringify(out, null, 1) + "\n");
console.log(`${Object.keys(out).length} ranuras medidas -> src/data/photos.render.json`);
