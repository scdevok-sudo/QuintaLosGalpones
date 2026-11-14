// Latencia del primer toque en un móvil emulado: CPU 4x y red tipo Lighthouse (1,6 Mbps, 150 ms de RTT).
// Mide desde el pointerdown hasta el pintado del panel de consulta, en dos casos:
//   "temprano": el toque llega apenas se ve el CTA, antes de que hidrate (el panel abre nativo, con el botón de WhatsApp).
//   "medio": el toque llega 2 s después de ver el CTA.
//   "hidratado": el toque llega con la app ya hidratada.
// Uso: npm run preview (otra terminal) y `node scripts/measure-tap.mjs [corridas]`.
import { chromium } from "playwright";
const base = process.env.BASE_URL || "http://localhost:4173";
const N = Number(process.argv[2] || 5);
const browser = await chromium.launch();

const initScript = () => {
  window.__m = {};
  addEventListener("pointerdown", (e) => {
    window.__m.t0 = e.timeStamp;
    window.__m.hidratadoAlToque = !!window.__qgReady;
  }, true);
  // El panel es un popover: "toggle" avisa cuando se abre. Se mide hasta el segundo cuadro después.
  document.addEventListener("toggle", (e) => {
    if (e.target.id === "consulta" && e.newState === "open" && !window.__m.abierto) {
      window.__m.abierto = performance.now();
      requestAnimationFrame(() => requestAnimationFrame(() => (window.__m.pintado = performance.now())));
    }
  }, true);
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__m.firstInput = { delay: e.processingStart - e.startTime, duracion: e.duration };
  }).observe({ type: "first-input", buffered: true });
};

async function run(modo) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36" });
  const page = await ctx.newPage();
  await page.addInitScript(initScript);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  const t0 = Date.now();
  await page.goto(base + "/", { waitUntil: "commit" });
  const cta = page.locator("section.hero button.btn[data-express]");
  await cta.waitFor({ state: "visible" });
  if (modo === "hidratado") await page.waitForFunction(() => window.__qgReady === true, null, { timeout: 30000 });
  if (modo === "medio") await page.waitForTimeout(2000);
  const quando = Date.now() - t0;
  // locator.tap() espera a que el CTA deje de moverse (el cambio de fuente lo corre) y toca donde está.
  await cta.tap();
  await page.waitForFunction(() => window.__m && window.__m.pintado, null, { timeout: 20000 }).catch(() => {});
  const m = await page.evaluate(() => window.__m);
  await ctx.close();
  return {
    tocaA: quando,
    hidratadoAlToque: m.hidratadoAlToque,
    toquePanel: m.pintado ? Math.round(m.pintado - m.t0) : null,
    inputDelay: m.firstInput ? Math.round(m.firstInput.delay) : null,
    inputDuracion: m.firstInput ? Math.round(m.firstInput.duracion) : null,
  };
}

const med = (a) => { const v = a.filter((x) => x != null).sort((p, q) => p - q); return v.length ? v[Math.floor(v.length / 2)] : null; };
for (const modo of (process.env.MODOS || "temprano,medio,hidratado").split(",")) {
  const rows = [];
  for (let i = 0; i < N; i++) rows.push(await run(modo));
  console.log(`\n== Toque ${modo} (${N} corridas, CPU 4x, 1,6 Mbps / 150 ms) ==`);
  for (const r of rows) console.log(JSON.stringify(r));
  console.log(`MEDIANA: toque->panel pintado ${med(rows.map((r) => r.toquePanel))} ms | input delay ${med(rows.map((r) => r.inputDelay))} ms | duración del evento ${med(rows.map((r) => r.inputDuracion))} ms | máximo toque->panel ${Math.max(...rows.map((r) => r.toquePanel ?? 0))} ms`);
}
await browser.close();
