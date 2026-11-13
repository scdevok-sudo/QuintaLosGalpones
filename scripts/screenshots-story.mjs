// Captura las 4 escenas del recorrido "Un día en Los Galpones" con el movimiento activo,
// y mide el contraste real del texto del panel en 0, 25, 50, 75 y 100 % del recorrido.
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4173";
const out = process.env.OUT_DIR || "shots";
mkdirSync(out, { recursive: true });

const sizes = [
  { name: "390", width: 390, height: 844, mobile: true },
  { name: "1280", width: 1280, height: 800, mobile: false },
];

const browser = await chromium.launch();
for (const size of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: size.mobile ? 2 : 1,
    isMobile: size.mobile,
    hasTouch: size.mobile,
    reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500); // el JS se hidrata recién después del LCP
  const info = await page.evaluate(() => {
    const s = document.querySelector(".story");
    const stage = s.firstElementChild;
    return { top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight, stage: stage.offsetHeight };
  });
  const range = info.h - info.stage;
  const stops = [0.02, 0.25, 0.5, 0.75, 0.98];
  for (const [i, p] of stops.entries()) {
    await page.evaluate((y) => window.scrollTo(0, y), info.top + p * range);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${out}/story-${size.name}-${Math.round(p * 100)}.png` });
    const r = await page.evaluate(() => {
      const hora = getComputedStyle(document.querySelector(".story")).getPropertyValue("--hora");
      const act = document.querySelector('.story-scene[data-state="active"]');
      const panel = act.querySelector(".story-panel");
      const cs = getComputedStyle(panel);
      return { hora, escena: act.getAttribute("aria-label"), fg: cs.color, bg: cs.backgroundColor };
    });
    console.log(size.name, `${Math.round(p * 100)}%`, JSON.stringify(r));
  }
  await ctx.close();
}
await browser.close();
