// Anexo v2.3: los CTA principales son enlaces reales y funcionan sin JS.
// Carga Inicio con JavaScript apagado, verifica href de cada CTA, que el contenido se lea y que el clic navegue.
import { chromium } from "playwright";
const base = process.env.BASE_URL || "http://localhost:4173";
const b = await chromium.launch();
let bad = 0;
const ok = (c, msg) => { console.log((c ? "OK  " : "MAL ") + msg); if (!c) bad++; };

const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto(base + "/");

const ctas = [
  ["hero, consulta", "section.hero a[data-express]", /\/contacto\/#formulario$/],
  ["hero, secundario", "section.hero a.link", /\/contacto\/#formulario$/],
  ["visita, WhatsApp", "#visita-rapida-titulo >> xpath=../.. >> a.btn", /^https:\/\/wa\.me\/\d+\?text=/],
  ["visita, cómo llegar", "#visita-rapida-titulo >> xpath=../.. >> a.link", /google\.com\/maps\/dir/],
  ["barra inferior", ".bar-consulta a[data-express]", /\/contacto\/#formulario$/],
  ["menú, coordinar visita", "header a.site-nav-action", /\/contacto\/#visita$/],
];
for (const [name, sel, re] of ctas) {
  const el = p.locator(sel).first();
  const href = await el.getAttribute("href");
  ok(Boolean(href) && re.test(href), `CTA ${name}: href=${href}`);
}
ok(await p.locator("h1").isVisible(), "el H1 se lee sin JS");
ok((await p.locator("dialog[open]").count()) === 0, "el panel de consulta no está abierto sin JS");
ok(await p.locator(".bar-consulta").isVisible(), "la barra inferior se ve sin JS");

// El clic en el CTA del hero sigue el enlace (no queda muerto)
await p.locator("section.hero a[data-express]").click();
await p.waitForURL(/\/contacto\//, { timeout: 5000 }).catch(() => {});
ok(/\/contacto\/#formulario$/.test(p.url()), `el clic sigue el enlace: ${p.url()}`);
await b.close();
process.exit(bad ? 1 : 0);
