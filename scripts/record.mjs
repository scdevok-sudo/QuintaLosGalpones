// Graba el movimiento de Inicio: un video .webm por escenario (Playwright) y fotogramas sueltos para revisarlos.
// Uso: npm run preview (otra terminal) y `node scripts/record.mjs [escenario ...]`.
// Escenarios: hero, recorrido, caminos, consulta, transicion, reducido.
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4173";
const out = process.env.OUT_DIR || "docs/checkpoint3";
mkdirSync(out, { recursive: true });
const wanted = process.argv.slice(2);
const want = (n) => !wanted.length || wanted.includes(n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();

async function scenario(name, vp, { mobile = false, reduced = false } = {}, fn) {
  const dir = `${out}/_${name}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: vp,
    deviceScaleFactor: 1,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: reduced ? "reduce" : "no-preference",
    recordVideo: { dir, size: vp },
  });
  const page = await ctx.newPage();
  const shot = (label) => page.screenshot({ path: `${out}/${name}-${label}.png` });
  await fn(page, shot);
  await ctx.close(); // cierra y guarda el video
  const vid = readdirSync(dir).find((f) => f.endsWith(".webm"));
  if (vid) renameSync(`${dir}/${vid}`, `${out}/${name}.webm`);
  console.log("grabado", name);
}

const D = { width: 1280, height: 800 };
const M = { width: 390, height: 844 };

async function storyBounds(page) {
  return page.evaluate(() => {
    const s = document.querySelector(".story");
    const stage = s.firstElementChild;
    return { top: s.getBoundingClientRect().top + scrollY, range: s.offsetHeight - stage.offsetHeight };
  });
}

// A. Entrada del hero (primera carga de la sesión: contexto nuevo = sessionStorage vacío)
if (want("hero"))
  for (const [tag, vp, mobile] of [["hero-desktop", D, false], ["hero-mobile", M, true]]) {
    await scenario(tag, vp, { mobile }, async (page, shot) => {
      await page.goto(base + "/", { waitUntil: "commit" });
      for (const [i, t] of [0, 150, 300, 500, 800, 1300].entries()) {
        await sleep(t ? 150 : 40);
        await shot(`f${i}`);
      }
      await sleep(1800);
      await shot("final");
      // Segunda carga en la misma sesión: no debe repetir la entrada
      await page.reload({ waitUntil: "commit" });
      await sleep(120);
      await shot("recarga");
    });
  }

// B. Recorrido completo
if (want("recorrido"))
  for (const [tag, vp, mobile] of [["recorrido-desktop", D, false], ["recorrido-mobile", M, true]]) {
    await scenario(tag, vp, { mobile }, async (page, shot) => {
      await page.goto(base + "/", { waitUntil: "load" });
      await sleep(2600);
      const { top, range } = await storyBounds(page);
      await page.evaluate((y) => window.scrollTo(0, y - 140), top);
      await sleep(900);
      // scroll continuo y lento a lo largo de todo el recorrido
      const steps = 70;
      let k = 0;
      for (let i = 0; i <= steps; i++) {
        await page.evaluate((y) => window.scrollTo(0, y), top + (i / steps) * range);
        await sleep(70);
        if (i % 10 === 0) await shot(`p${String(k++).padStart(2, "0")}`);
      }
      // fotogramas dentro de una transición de escena (cortina): cruzar el 25 %
      await page.evaluate((y) => window.scrollTo(0, y), top + 0.2 * range);
      await sleep(800);
      await page.evaluate((y) => window.scrollTo(0, y), top + 0.27 * range);
      for (const [i, t] of [60, 140, 240, 400].entries()) {
        await sleep(i ? t - [60, 140, 240, 400][i - 1] : t);
        await shot(`cortina${i}`);
      }
      await sleep(800);
    });
  }

// C. Dos caminos (solo desktop)
if (want("caminos"))
  await scenario("caminos-desktop", D, {}, async (page, shot) => {
    await page.goto(base + "/", { waitUntil: "load" });
    await sleep(2600);
    await page.evaluate(() => document.querySelector(".caminos").scrollIntoView({ block: "center" }));
    await sleep(700);
    await shot("reposo");
    await page.hover(".camino-b");
    await sleep(900);
    await shot("hover-empresas");
    await page.hover(".camino-a");
    await sleep(900);
    await shot("hover-casamientos");
    await page.mouse.move(5, 5);
    await sleep(800);
    await page.keyboard.press("Tab");
    await page.focus(".camino-b a");
    await sleep(900);
    await shot("foco-empresas");
  });

// D. Consulta express
if (want("consulta"))
  for (const [tag, vp, mobile] of [["consulta-desktop", D, false], ["consulta-mobile", M, true]]) {
    await scenario(tag, vp, { mobile }, async (page, shot) => {
      await page.goto(base + "/", { waitUntil: "load" });
      await sleep(2600);
      await page.getByRole("link", { name: "Vení a conocer la quinta" }).click();
      await sleep(60);
      await shot("abre-60ms");
      await sleep(500);
      await shot("paso1");
      await page.getByLabel("Evento de empresa").check();
      await page.getByLabel("De 100 a 200").check();
      await sleep(200);
      await page.getByRole("button", { name: "Seguir" }).click();
      await sleep(80);
      await shot("paso2-entra");
      await sleep(400);
      await page.getByRole("button", { name: "Prefiero que me escriban" }).click();
      await sleep(400);
      await page.getByRole("button", { name: "Cerrar el panel" }).click();
      await sleep(100);
      await shot("cierra-100ms");
      await sleep(500);
    });
  }

// E. Transición entre páginas (la única otra ruta hoy es el 404)
if (want("transicion"))
  await scenario("transicion-desktop", D, {}, async (page, shot) => {
    await page.goto(base + "/", { waitUntil: "load" });
    await sleep(2600);
    await page.getByRole("link", { name: "Contacto" }).first().click();
    await sleep(60);
    await shot("t60");
    await sleep(120);
    await shot("t180");
    await sleep(900);
    await shot("destino");
  });

// F. Con prefers-reduced-motion: reduce (estado final estático)
if (want("reducido")) {
  await scenario("reducido-desktop", D, { reduced: true }, async (page, shot) => {
    await page.goto(base + "/", { waitUntil: "load" });
    await sleep(2600);
    await shot("hero");
    await page.evaluate(() => document.querySelector(".story").scrollIntoView());
    await sleep(500);
    await shot("recorrido");
    await page.evaluate(() => document.querySelector(".caminos").scrollIntoView({ block: "center" }));
    await sleep(500);
    await shot("caminos");
    await page.getByRole("link", { name: "Vení a conocer la quinta" }).first().scrollIntoViewIfNeeded();
  });
  await scenario("reducido-mobile", M, { mobile: true, reduced: true }, async (page, shot) => {
    await page.goto(base + "/", { waitUntil: "load" });
    await sleep(2600);
    await shot("hero");
    await page.evaluate(() => document.querySelector(".story").scrollIntoView());
    await sleep(500);
    await shot("recorrido");
    await page.getByRole("link", { name: "Vení a conocer la quinta" }).scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("link", { name: "Vení a conocer la quinta" }).click();
    await sleep(300);
    await shot("consulta");
  });
}

await browser.close();
