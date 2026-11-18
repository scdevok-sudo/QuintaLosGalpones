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
for (const [name, sel] of [["hero", "section.hero button[data-express]"], ["hero, secundario", "section.hero button.link[data-express]"], ["visita, consulta", "#visita button[data-express]"], ["barra inferior", ".bar-consulta button[data-express]"], ["cierre nocturno", "section[aria-label='Consultar por mi fecha'] button[data-express]"]]) {
  const t = await p.locator(sel).first().getAttribute("popovertarget");
  ok(t === "consulta", `CTA ${name}: popovertarget=${t}`);
}
// 2. Enlaces reales a WhatsApp o a Maps
for (const [name, sel, re] of [
  ["visita, Contacto", "#visita a.btn", /^\/contacto#visita$/],
  ["menú, coordinar visita", "header a.site-nav-action", /^\/contacto#visita$/],
  ["cierre, cómo llegar", "section[aria-label='Cómo llegar'] a.link", /google\.com\/maps\/dir/],
]) {
  const href = await p.locator(sel).first().getAttribute("href");
  ok(Boolean(href) && re.test(href), `CTA ${name}: href=${(href || "").slice(0, 60)}`);
}
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

// 5. Contacto sin JS: dos botones de WhatsApp reales y aviso del formulario
await p.goto(base + "/contacto");
for (const [name, sel] of [["Contacto, WhatsApp", "section.dia a.btn-primary"], ["Contacto, visita", "section.dia a.btn-line"], ["Contacto, bloque de visita", "#visita a.btn"]]) {
  const href = await p.locator(sel).first().getAttribute("href");
  ok(/^https:\/\/wa\.me\/\d+\?text=/.test(href || ""), `${name}: ${(href || "").slice(0, 40)}`);
}
ok(await p.locator("#formulario").count() === 1 && await p.locator("#visita").count() === 1, "Contacto tiene #formulario y #visita");
ok((await p.locator("#formulario").innerText()).includes("WhatsApp"), "sin JS el formulario ofrece WhatsApp");
// 6. Mapa estático: imagen y los dos enlaces de Google Maps funcionan sin JS
for (const route of ["/", "/contacto"]) {
  await p.goto(base + route);
  ok(await p.locator(".map img").isVisible(), `${route}: el mapa estático se ve sin JS`);
  ok(/google\.com\/maps\/search\/\?api=1&query=/.test((await p.locator(".map a.btn").getAttribute("href")) || ""), `${route}: "Ver el mapa" es un enlace a Google Maps`);
  ok(/google\.com\/maps\/dir\/\?api=1&destination=/.test((await p.locator("a.link", { hasText: "Cómo llegar" }).first().getAttribute("href")) || ""), `${route}: "Cómo llegar" arma la ruta`);
}
await b.close();
process.exit(bad ? 1 : 0);
