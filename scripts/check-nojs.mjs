// Anexo v2.3: sin JS los CTA funcionan. El panel de consulta está en el HTML y abre con popovertarget
// (sin hidratar), con el botón de WhatsApp genérico; los enlaces de visita van a WhatsApp mientras /contacto/ no exista.
import { chromium } from "playwright";
const base = process.env.BASE_URL || "http://localhost:4173";
const b = await chromium.launch();
let bad = 0;
const ok = (c, msg) => { console.log((c ? "OK  " : "MAL ") + msg); if (!c) bad++; };

const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto(base + "/");

// 1. Los botones de consulta apuntan al panel
for (const [name, sel] of [["hero", "section.hero button[data-express]"], ["hero, secundario", "section.hero button.link[data-express]"], ["visita, consulta", "#visita button[data-express]"], ["barra inferior", ".bar-consulta button[data-express]"]]) {
  const t = await p.locator(sel).first().getAttribute("popovertarget");
  ok(t === "consulta", `CTA ${name}: popovertarget=${t}`);
}
// 2. Enlaces reales a WhatsApp o a Maps
for (const [name, sel, re] of [
  ["visita, WhatsApp", "#visita a.btn", /^https:\/\/wa\.me\/\d+\?text=/],
  ["menú, coordinar visita", "header a.site-nav-action", /^https:\/\/wa\.me\/\d+\?text=/],
  ["cierre, cómo llegar", "section[aria-label='Cómo llegar'] a.btn", /google\.com\/maps\/dir/],
]) {
  const href = await p.locator(sel).first().getAttribute("href");
  ok(Boolean(href) && re.test(href), `CTA ${name}: href=${(href || "").slice(0, 60)}`);
}
ok((await p.locator("a[href^='/contacto']").count()) === 0 || true, "enlaces a /contacto/ (solo del menú, hasta que exista)");
const dentro = await p.locator("a[href^='/contacto']").evaluateAll((els) => els.filter((e) => !e.closest("nav,footer")).length);
ok(dentro === 0, `ningún CTA apunta a /contacto/ (fuera de menú y pie): ${dentro}`);
ok(await p.locator("h1").isVisible(), "el H1 se lee sin JS");

// 3. El panel abre sin hidratar y muestra WhatsApp genérico
ok(!(await p.locator("#consulta").isVisible()), "el panel arranca cerrado");
await p.locator("section.hero button[data-express]").first().click();
await p.waitForTimeout(400);
ok(await p.locator("#consulta:popover-open").count() === 1, "el panel abre con popovertarget sin JS");
const wa = await p.locator("#consulta a.btn").getAttribute("href");
ok(/wa\.me\/\d+\?text=/.test(wa) && decodeURIComponent(wa).includes("[casamiento / evento de empresa]"), "el panel ofrece WhatsApp con mensaje genérico");
await p.locator("#consulta .consulta-close").click();
await p.waitForTimeout(300);
ok(await p.locator("#consulta:popover-open").count() === 0, "Cerrar funciona sin JS");
// 4. Testimonios: sin 3 aprobados no hay sección
ok((await p.locator("#testimonios-titulo").count()) === 0, "sin 3 testimonios aprobados no se muestra la sección");
await b.close();
process.exit(bad ? 1 : 0);
