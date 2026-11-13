// Verifica con mediciones (no solo capturas) que los efectos de movimiento ocurren.
// Usa scroll instantáneo para no contaminar las mediciones con el scroll suave del sitio.
import { chromium } from "playwright";
const base = process.env.BASE_URL || "http://localhost:4173";
const b = await chromium.launch();
const result = {};

async function fresh() {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "no-preference" });
  const p = await ctx.newPage();
  await p.goto(base + "/");
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await p.waitForTimeout(2600);
  return p;
}
const toEl = (p, sel, offset) =>
  p.evaluate(([s, o]) => { const r = document.querySelector(s).getBoundingClientRect(); scrollTo(0, scrollY + r.top - o); }, [sel, offset]);

// C. Título cinético: peso del h2 "Cómo seguimos" mientras cruza la pantalla de abajo hacia arriba
{
  const p = await fresh();
  const muestras = [];
  for (const topPx of [1000, 800, 650, 500, 350, 200]) {
    await p.evaluate((t) => {
      const h = [...document.querySelectorAll("main h2")].find((x) => x.textContent.includes("Cómo seguimos"));
      scrollTo(0, scrollY + h.getBoundingClientRect().top - t);
    }, topPx);
    await p.waitForTimeout(350);
    muestras.push(await p.evaluate((t) => { const h = [...document.querySelectorAll("main h2")].find((x) => x.textContent.includes("Cómo seguimos")); return `top ${t}px: peso ${Math.round(+getComputedStyle(h).fontWeight)}`; }, topPx));
  }
  result.C_titulos_cineticos = muestras;
  await p.context().close();
}

// D. Máscara con vida: --roof-k de la foto de casamientos mientras entra
{
  const p = await fresh();
  const m = [];
  for (const topPx of [1000, 750, 600, 450, 250]) {
    await p.evaluate((t) => { const r = document.querySelector(".camino-a .mask-live").getBoundingClientRect(); scrollTo(0, scrollY + r.top - t); }, topPx);
    await p.waitForTimeout(350);
    m.push(`top ${topPx}px: --roof-k ${await p.evaluate(() => (+getComputedStyle(document.querySelector(".camino-a .mask-live")).getPropertyValue("--roof-k")).toFixed(2))}`);
  }
  result.D_mascara_con_vida = m;
  await p.context().close();
}

// F. Luz que sigue al cursor sobre superficie noche
{
  const p = await fresh();
  await toEl(p, "section.noche-2", 0); await p.waitForTimeout(400);
  const antes = await p.evaluate(() => getComputedStyle(document.querySelector("section.noche-2")).getPropertyValue("--gx").trim());
  await p.mouse.move(300, 300); await p.waitForTimeout(100); await p.mouse.move(900, 450); await p.waitForTimeout(500);
  const despues = await p.evaluate(() => getComputedStyle(document.querySelector("section.noche-2")).getPropertyValue("--gx").trim());
  result.F_luz_cursor = { antes: antes || "(brillo fijo)", despues };
  await p.context().close();
}

// G. Contador de la ficha: texto cada 150 ms desde que entra a pantalla
{
  const p = await fresh();
  await p.evaluate(() => { const r = document.querySelector("dl").getBoundingClientRect(); scrollTo(0, scrollY + r.top - 200); });
  const m = [];
  for (let i = 0; i < 8; i++) { await p.waitForTimeout(150); m.push(await p.evaluate(() => document.querySelector("dl .tabular-nums").textContent)); }
  result.G_contador_parque = m.join(" > ");
  await p.context().close();
}

// K. Pin del mapa mientras entra
{
  const p = await fresh();
  const m = [];
  for (const topPx of [1000, 800, 650, 500]) {
    await p.evaluate((t) => { const r = document.querySelector(".pin").getBoundingClientRect(); scrollTo(0, scrollY + r.top - t); }, topPx);
    await p.waitForTimeout(350);
    m.push(`top ${topPx}px: ` + (await p.evaluate(() => { const c = getComputedStyle(document.querySelector(".pin")); return `opacidad ${(+c.opacity).toFixed(2)}, ${c.transform}`; })));
  }
  result.K_pin = m;
  await p.context().close();
}

// L. Barra solar del header
{
  const p = await fresh();
  const sol = () => p.evaluate(() => getComputedStyle(document.querySelector(".sunbar-line")).transform);
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
  const a = await sol();
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(400);
  result.L_barra_solar = { arriba: a, abajo: await sol() };
  await p.context().close();
}

console.log(JSON.stringify(result, null, 1));
await b.close();
