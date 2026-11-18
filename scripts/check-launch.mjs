// Lista lo que falta para publicar. No bloquea el preview; es la puerta antes del lanzamiento.
import { readFileSync } from "node:fs";

const read = (f) => readFileSync(f, "utf8");
const pend = [];
const photos = read("src/content/photos.ts");
const slotMap = JSON.parse(read("src/data/photos.slots.json"));
const manifest = JSON.parse(read("src/data/photos.manifest.json"));
const allSlots = [...photos.matchAll(/^\s+"?([\w.]+)"?: use\(/gm)].map((m) => m[1]);
const legacy = allSlots.filter((n) => !slotMap[n]);
if (legacy.length) pend.push(`Fotos provisorias del sitio actual (temp): ${legacy.length} slots todavía no tienen foto nueva (${legacy.join(", ")}).`);
// Fotos procesadas en uso: las bloqueadas hacen fallar; las provisorias son advertencias para el cliente.
const fail = [];
const inUse = new Map();
for (const [slot, c] of Object.entries(slotMap)) inUse.set(c.foto, [...(inUse.get(c.foto) ?? []), slot]);
const motivos = {
  procedencia: "Procedencia sin confirmar (sin EXIF o con acabado de imagen retocada)",
  rostros: "Rostros sin permiso confirmado",
  resolucion: "Resolución baja (menos de 2000 px de lado largo): pedir el original",
};
const porMotivo = { procedencia: [], rostros: [], resolucion: [] };
for (const [id, slots] of inUse) {
  const m = manifest.find((x) => x.id === id && x.seccion !== "og");
  if (!m) {
    fail.push(`${id} (${slots.join(", ")}) no está en el manifiesto: correr npm run photos:build.`);
    continue;
  }
  if (m.estado === "bloqueada") fail.push(`${id} está bloqueada y se usa en ${slots.join(", ")}.`);
  for (const p of m.pendientes ?? []) porMotivo[p].push(`${id} (${slots.join(", ")})`);
}
if (/approved: false/.test(read("src/content/home.ts"))) pend.push("Testimonios sin autorización de nombre e imagen (approved: false).");
if (!/reviews: Review\[\] = \[[^\]]*\w/.test(read("src/content/reviews.ts"))) pend.push("Sin reseñas de Google cargadas.");
const site = read("src/config/site.ts");
for (const [k, label] of [["whatsapp", "WhatsApp (titular y enlace)"], ["email", "Correo con dominio propio"], ["mapsUrl", "Enlace al perfil de Google Maps"], ["coordinates", "Coordenadas"], ["presupuestoBloque", "Bloque \"Cómo se arma tu presupuesto\" de Casamientos (no se muestra hasta aprobarlo)"], ["privacyReviewed", "Revisión legal de la política de privacidad"]]) {
  const m = site.match(new RegExp(`${k}:[^\n]*validated: (true|false)`));
  if (!m || m[1] === "false") pend.push(`Dato sin validar: ${label}.`);
}
let env = "";
try { env = read(".env.local"); } catch {}
if (!/VITE_GA_ID=\S+/.test(env)) pend.push("Falta ID de Google Analytics (VITE_GA_ID).");
if (!/VITE_FORM_ENDPOINT=\S+/.test(env)) pend.push("Falta endpoint del formulario (VITE_FORM_ENDPOINT).");
if (/VITE_NOINDEX=true/.test(env)) pend.push("VITE_NOINDEX=true: poner false al publicar.");
if (/pending: true/.test(photos)) pend.push("Falta foto real del armado cubierto con lluvia (slot lluvia.cubierto): el interruptor Sol/Lluvia no se muestra hasta tenerla.");
if (/VITE_PREVIEW_PENDING=true/.test(env)) pend.push("VITE_PREVIEW_PENDING=true: quitarlo al publicar.");
try {
  const html = read("dist/index.html");
  const noscript = [...html.matchAll(/<noscript>([\s\S]*?)<\/noscript>/g)].map((m) => m[1]).join("");
  const srcs = new Set([...(html + noscript).matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]));
  if (srcs.size < 12) pend.push(`Inicio usa ${srcs.size} fotos distintas; la meta es de 12 a 20 reales sin repetir (depende de la Fase 2).`);
} catch {}
// Páginas del menú que no existen en dist/ y enlaces internos rotos (hace falta `npm run build` antes).
try {
  const { findBrokenLinks } = await import("./check-links.mjs");
  const { pages, broken } = findBrokenLinks();
  const nav = [...read("src/content/common.ts").matchAll(/to: "(\/[a-z-]*)"/g)].map((m) => m[1]);
  const faltan = [...new Set(nav)].filter((p) => !pages.includes(p));
  if (faltan.length) pend.push(`Páginas del menú que todavía no existen: ${faltan.join(", ")}.`);
  if (broken.length) pend.push(`Enlaces internos rotos (${broken.length}): ${broken.slice(0, 6).join("; ")}${broken.length > 6 ? "…" : ""}`);
} catch {
  pend.push("No se pudo revisar enlaces: correr npm run build antes de check:launch.");
}
pend.push("Logo reconstruido a partir de una captura de baja resolución: pedir vectorial original al cliente.");
if (/rangosValidated = false/.test(read("src/config/consulta.ts"))) pend.push("Rangos de invitados del formulario sin confirmar con el cliente (src/config/consulta.ts).");
if (/realesVisible = true/.test(read("src/content/reales.ts")) && legacy.some((n) => n.startsWith("reales."))) pend.push("Eventos reales está visible (realesVisible) y sus fotos son provisorias sin aprobación de quienes aparecen (approved: false). Para ocultarla: realesVisible = false en src/content/reales.ts.");
console.log("Pendientes para lanzar:\n" + pend.map((p) => "  - " + p).join("\n"));
const pc = Object.entries(porMotivo).filter(([, v]) => v.length);
if (pc.length) {
  console.log("\nPendiente de confirmación del cliente (advertencias, no bloquean):");
  for (const [k, v] of pc) console.log(`  - ${motivos[k]}: ${v.join("; ")}`);
}
if (fail.length) {
  console.log("\nERRORES (fotos bloqueadas en uso):\n" + fail.map((p) => "  - " + p).join("\n"));
  process.exitCode = 1;
}
