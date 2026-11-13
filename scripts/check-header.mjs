// Verifica que la marca no se pise con el menú a 360, 390, 768, 1280 y 1920 px.
import { chromium } from "playwright";
const base = process.env.BASE_URL || "http://localhost:4173";
const browser = await chromium.launch();
let bad = 0;
for (const w of [360, 390, 768, 1024, 1280, 1920]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  await page.goto(base + "/");
  const r = await page.evaluate(() => {
    const vis = (el) => el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== "hidden";
    const brand = [...document.querySelectorAll("header a img")].filter(vis).map((e) => e.getBoundingClientRect());
    const items = [...document.querySelectorAll("header .nav-link, header .site-nav-action, header button")].filter(vis).map((e) => e.getBoundingClientRect());
    const b = brand[0];
    const clash = items.filter((i) => i.left < b.right && i.right > b.left && i.top < b.bottom && i.bottom > b.top).length;
    return { brandRight: Math.round(b.right), minItemLeft: Math.round(Math.min(...items.map((i) => i.left))), overflowX: document.documentElement.scrollWidth > innerWidth, clash };
  });
  const ok = r.clash === 0 && !r.overflowX;
  if (!ok) bad++;
  console.log(ok ? "OK " : "MAL", w, JSON.stringify(r));
  await page.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
