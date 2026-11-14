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

// E. Dos caminos: hover de 2 px en la card y zoom de 1,02 en la foto; los CTA se ven siempre
{
  const p = await fresh();
  await toEl(p, ".caminos", 150); await p.waitForTimeout(500);
  const med = () => p.evaluate(() => {
    const c = document.querySelector(".camino");
    const img = c.querySelector(".ph img");
    const btn = c.querySelector(".btn");
    return { card: getComputedStyle(c).transform, foto: getComputedStyle(img).transform, ctaVisible: getComputedStyle(btn).opacity === "1" && btn.getBoundingClientRect().height > 0 };
  });
  const reposo = await med();
  await p.hover(".camino"); await p.waitForTimeout(700);
  result.E_caminos = { reposo, hover: await med() };
  await p.context().close();
}

// Lo que ya no debe existir (anexo v2.3)
{
  const p = await fresh();
  result.removidos = await p.evaluate(() => ({
    carrusel: document.querySelectorAll(".car-track").length,
    contadores: document.querySelectorAll(".tabular-nums").length,
    barraSolar: document.querySelectorAll(".sunbar").length,
    pin: document.querySelectorAll(".pin").length,
    magnetico: document.querySelectorAll(".magnetic").length,
    mascaras: [...document.querySelectorAll(".mask-galpon")].map((e) => e.closest("section")?.getAttribute("aria-labelledby") || e.closest("section")?.className),
  }));
  await p.context().close();
}

console.log(JSON.stringify(result, null, 1));
await b.close();
