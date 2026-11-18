// Capturas del recorrido en 360x740, 390x844, 412x915, 768x1024 y 1280x800: una por escena (con el movimiento activo).
// Uso: npm run preview (otra terminal) y `node scripts/story-shots.mjs [carpeta]`. Mide también el alto visible de la foto.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4173";
const out = process.argv[2] || "shots/recorrido";
mkdirSync(out, { recursive: true });
const sizes = [[360, 740, true], [390, 844, true], [412, 915, true], [768, 1024, true], [1280, 800, false]];
const browser = await chromium.launch();
for (const [w, h, mobile] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const s = document.querySelector(".story");
    return { top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight, stage: s.firstElementChild.offsetHeight };
  });
  const range = info.h - info.stage;
  for (const [i, p] of [0.1, 0.35, 0.6, 0.9].entries()) {
    await page.evaluate((y) => window.scrollTo(0, y), info.top + p * range);
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `${out}/${w}x${h}-escena${i + 1}.png` });
    if (i === 0) {
      const m = await page.evaluate(() => {
        const a = document.querySelector('.story-scene[data-state="active"]');
        const panel = a.querySelector(".story-panel").getBoundingClientRect();
        const sc = a.getBoundingClientRect();
        const band = document.querySelector(".story-band").getBoundingClientRect();
        const hh = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
        return { vh: innerHeight, header: Math.round(hh), band: Math.round(band.height), scenes: Math.round(sc.height), panel: Math.round(panel.height), fotoVisible: Math.round(panel.top - sc.top) };
      });
      console.log(`${w}x${h}`, JSON.stringify(m), "foto/pantalla", (m.fotoVisible / m.vh * 100).toFixed(0) + "%");
    }
  }
  await ctx.close();
}
await browser.close();
