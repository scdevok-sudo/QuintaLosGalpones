// Capturas con Playwright de las rutas del sitio en 390, 768 y 1280 px.
// Uso: npm run preview (en otra terminal) y luego `node scripts/screenshots.mjs [ruta ...]`.
// Las capturas van a shots/ (ignorado por git).
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4173";
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];
const sizes = [
  { name: "390", width: 390, height: 844, mobile: true },
  { name: "768", width: 768, height: 1024, mobile: false },
  { name: "1280", width: 1280, height: 800, mobile: false },
];
const out = process.env.OUT_DIR || "shots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const size of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: size.mobile ? 2 : 1,
    isMobile: size.mobile,
    hasTouch: size.mobile,
    // Los reveals por scroll quedan en su estado final; el motion se revisa aparte.
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  for (const route of routes) {
    const slug = route === "/" ? "inicio" : route.replace(/^\/|\/$/g, "").replace(/\//g, "-");
    await page.goto(base + route, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${out}/${slug}-${size.name}-fold.png` });
    // Recorre la página para disparar las imágenes lazy antes de la captura completa.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    // Solo para la captura completa: content-visibility oculta lo que no está en el viewport.
    await page.addStyleTag({ content: ".cv{content-visibility:visible !important}" });
    await page.waitForTimeout(1000); // el iframe del mapa mantiene la red ocupada: no usar networkidle acá
    await page.screenshot({ path: `${out}/${slug}-${size.name}-full.png`, fullPage: true });
    if (size.mobile) {
      await page.getByRole("button", { name: "Menú" }).click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${out}/${slug}-${size.name}-menu.png` });
    }
  }
  await ctx.close();
}
await browser.close();
console.log("Capturas en", out);
