// El botón de avanzar (paso 1) y el de enviar (contacto) tienen que verse sin scrollear el panel, en pantallas bajas.
import { chromium } from "playwright";
const base = process.env.BASE_URL || "http://localhost:4173";
const b = await chromium.launch();
let bad = 0;
for (const [w, h] of [[320, 568], [360, 640], [375, 667], [360, 740], [390, 844], [412, 915]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(base + "/", { waitUntil: "load" });
  await p.waitForFunction(() => window.__qgReady === true, null, { timeout: 20000 });
  await p.locator(".bar-consulta button").tap();
  await p.waitForTimeout(400);
  const medir = (sel) => p.evaluate((s) => {
    const panel = document.querySelector("#consulta").getBoundingClientRect();
    const el = document.querySelector(s).getBoundingClientRect();
    return { panelPct: +(panel.height / innerHeight * 100).toFixed(1), visible: el.top >= panel.top - 0.5 && el.bottom <= panel.bottom + 0.5 && el.bottom <= innerHeight, scrollTop: document.querySelector("#consulta").scrollTop };
  }, sel);
  const r1 = await medir("#consulta .consulta-sticky button");
  await p.getByRole("button", { name: "Seguir" }).tap();
  await p.getByRole("button", { name: "Prefiero que me escriban" }).tap();
  await p.waitForTimeout(300);
  const r2 = await medir("#consulta .consulta-sticky button[type=submit]");
  const ok = r1.visible && r2.visible && r1.scrollTop === 0;
  if (!ok) bad++;
  console.log(ok ? "OK " : "MAL", `${w}x${h}`, `paso 1: panel ${r1.panelPct} % de la pantalla, Seguir visible=${r1.visible}`, `| contacto: panel ${r2.panelPct} %, Enviar visible=${r2.visible}`);
  await ctx.close();
}
await b.close();
process.exit(bad ? 1 : 0);
