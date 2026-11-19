// photos:diag: diagnóstico de fotos en escritorio sobre el sitio real (npm run preview en otra terminal).
// Para cada foto de cada página, a 1280x800, 1440x900 y 1920x1080 (1x): caja renderizada, resolución real de la
// fuente, ampliación (renderizado / natural: > 1 es blando), parte de la foto que queda visible y captura del bloque.
// Uso: node scripts/photos-diag.mjs [carpeta] [--md archivo.md]
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4173";
const args = process.argv.slice(2);
const mdIdx = args.indexOf("--md");
const md = mdIdx >= 0 ? args.splice(mdIdx, 2)[1] : null;
const out = args[0] || "shots/diag";
mkdirSync(out, { recursive: true });
const sizes = [[1280, 800], [1440, 900], [1920, 1080]];
const routes = ["/", "/casamientos", "/espacios", "/contacto", "/eventos-reales"];
const rows = [];
const browser = await chromium.launch();
for (const [w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const route of routes) {
    const slug = route === "/" ? "inicio" : route.slice(1);
    await page.goto(base + route, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ".cv{content-visibility:visible !important}" });
    await page.evaluate(async () => {
      document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.7) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 140));
      }
    });
    await page.waitForTimeout(1200);
    await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))));
    const items = await page.evaluate(() => {
      return [...document.querySelectorAll(".ph img")].map((img, i) => {
        const ph = img.closest(".ph");
        const r = img.getBoundingClientRect();
        // naturalWidth viene corregido por densidad (srcset con w): el ancho real en píxeles está en el nombre del archivo.
        const px = +((img.currentSrc || img.src).match(/-w(\d+)\./)?.[1] ?? 0);
        const nat = px ? { w: px, h: Math.round((px * img.naturalHeight) / img.naturalWidth) } : { w: img.naturalWidth, h: img.naturalHeight };
        const slot = ph.querySelector(".ph-tag")?.textContent ?? null;
        // Parte de la foto que se ve con object-fit: cover.
        const k = Math.max(r.width / nat.w, r.height / nat.h);
        const vis = nat.w ? { x: Math.min(1, r.width / (nat.w * k)), y: Math.min(1, r.height / (nat.h * k)) } : null;
        return { i, src: (img.currentSrc || img.src).split("/").pop(), w: Math.round(r.width), h: Math.round(r.height), nat, scale: nat.w ? +(k).toFixed(2) : null, vis, inStory: !!img.closest(".story-scene") };
      });
    });
    for (const it of items) {
      if (!it.w || it.inStory) continue;
      const loc = page.locator(".ph img").nth(it.i);
      await loc.scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
      const file = `${out}/${slug}-${w}-${String(it.i).padStart(2, "0")}.png`;
      await loc.locator("xpath=ancestor::div[contains(@class,'ph')][1]").screenshot({ path: file }).catch(() => {});
      rows.push({ vw: w, route, ...it, file });
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${out}/${slug}-${w}-full.png`, fullPage: true });
  }
  // Recorrido: una captura por escena con el movimiento activo.
  {
    const c2 = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
    const pg = await c2.newPage();
    await pg.goto(base + "/", { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(2000);
    const info = await pg.evaluate(() => {
      const s = document.querySelector(".story");
      return { top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight, stage: s.firstElementChild.offsetHeight };
    });
    for (const [i, p] of [0.1, 0.35, 0.6, 0.9].entries()) {
      await pg.evaluate((y) => scrollTo(0, y), info.top + p * (info.h - info.stage));
      await pg.waitForTimeout(1400);
      await pg.screenshot({ path: `${out}/recorrido-${w}-escena${i + 1}.png` });
      const m = await pg.evaluate(() => {
        const img = document.querySelector('.story-scene[data-state="active"] img');
        const r = img.getBoundingClientRect();
        const px = +((img.currentSrc || img.src).match(/-w(\d+)\./)?.[1] ?? 0);
        const nat = { w: px, h: Math.round((px * img.naturalHeight) / img.naturalWidth) };
        const ph = img.closest(".ph").getBoundingClientRect();
        const k = Math.max(ph.width / nat.w, ph.height / nat.h) * (matchMedia("(min-width:1024px)").matches ? 1.12 : 1);
        return { src: (img.currentSrc || img.src).split("/").pop(), w: Math.round(ph.width), h: Math.round(ph.height), nat, scale: +k.toFixed(2), vis: { x: Math.min(1, ph.width / (nat.w * k)), y: Math.min(1, ph.height / (nat.h * k)) } };
      });
      rows.push({ vw: w, route: `/ recorrido ${i + 1}`, i: 900 + i, ...m, file: "" });
    }
    await c2.close();
  }
  await ctx.close();
}
await browser.close();
const bad = (r) => r.scale > 1.05 || (r.vis && (r.vis.x < 0.7 || r.vis.y < 0.7));
const lines = ["| Ancho | Página | Foto servida | Caja | Natural | Ampliación | Visible (x / y) | Problema |", "|---|---|---|---|---|---|---|---|"];
for (const r of rows) {
  const p = [];
  if (r.scale > 1.05) p.push(`blanda (${r.scale}x)`);
  if (r.vis && r.vis.x < 0.7) p.push(`recorte lateral ${Math.round((1 - r.vis.x) * 100)} %`);
  if (r.vis && r.vis.y < 0.7) p.push(`recorte vertical ${Math.round((1 - r.vis.y) * 100)} %`);
  lines.push(`| ${r.vw} | ${r.route} | ${r.src} | ${r.w}x${r.h} | ${r.nat.w}x${r.nat.h} | ${r.scale} | ${r.vis ? Math.round(r.vis.x * 100) + " / " + Math.round(r.vis.y * 100) + " %" : "-"} | ${p.join(", ") || "ok"} |`);
}
console.log(lines.join("\n"));
console.log(`\n${rows.filter(bad).length} de ${rows.length} fotos con problema`);
if (md) writeFileSync(md, lines.join("\n") + "\n");
