// Prueba el flujo de la consulta express y mide contraste de los pares de superficie.
import { chromium } from "playwright";
const base = process.env.BASE_URL || "http://localhost:4173";
const out = process.env.OUT_DIR || "shots";

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return ((x + 0.05) / (y + 0.05)).toFixed(2);
};
const pairs = [
  ["tinta sobre tarde (texto día)", "#231B13", "#E9E6D2"],
  ["tarde sobre noche (texto noche)", "#E9E6D2", "#151D18"],
  ["noche sobre lamparita (botón noche)", "#151D18", "#FFB347"],
  ["tarde sobre tinta (botón día)", "#E9E6D2", "#231B13"],
  ["lamparita sobre noche (subrayado/número)", "#FFB347", "#151D18"],
  ["madera sobre tarde (texto grande)", "#8A5A36", "#E9E6D2"],
  ["eucalipto sobre tarde (decorativo)", "#6F836F", "#E9E6D2"],
];
for (const [n, a, b] of pairs) console.log(ratio(a, b).padStart(6), n);

const browser = await chromium.launch();
for (const [name, vp, mobile] of [["1280", { width: 1280, height: 800 }, false], ["390", { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const page = await ctx.newPage();
  await page.goto(base + "/");
  await page.waitForTimeout(2500); // el JS se hidrata recién después del LCP
  await page.getByRole("button", { name: "Vení a conocer la quinta" }).click();
  await page.waitForSelector("#consulta:popover-open");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/express-${name}-1.png` });
  await page.getByLabel("Empresa").check();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Seguir" }).click();
  const wa = await page.getByRole("link", { name: "Seguir por WhatsApp" }).getAttribute("href");
  console.log(name, "WhatsApp:", decodeURIComponent(wa.split("text=")[1]));
  await page.screenshot({ path: `${out}/express-${name}-2.png` });
  await page.getByRole("button", { name: "Prefiero que me escriban" }).click();
  await page.getByRole("button", { name: "Enviar consulta" }).click();
  console.log(name, "errores:", await page.locator(".field-error").allTextContents());
  await page.keyboard.press("Escape");
  console.log(name, "cierra con Esc:", !(await page.locator("#consulta:popover-open").count()));
  await ctx.close();
}
await browser.close();
