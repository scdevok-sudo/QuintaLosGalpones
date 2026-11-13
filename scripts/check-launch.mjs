// Lista lo que falta para publicar. No bloquea el preview; es la puerta antes del lanzamiento.
import { readFileSync } from "node:fs";

const read = (f) => readFileSync(f, "utf8");
const pend = [];
const photos = read("src/content/photos.ts");
const nPhotos = [...photos.matchAll(/make\(/g)].length - 1;
pend.push(`Fotos provisorias (temp): ${nPhotos} slots usan imágenes del sitio actual (Fase 2).`);
if (/approved: false/.test(read("src/content/home.ts"))) pend.push("Testimonios sin autorización de nombre e imagen (approved: false).");
if (!/reviews: Review\[\] = \[[^\]]*\w/.test(read("src/content/reviews.ts"))) pend.push("Sin reseñas de Google cargadas.");
const site = read("src/config/site.ts");
for (const [k, label] of [["whatsapp", "WhatsApp (titular y enlace)"], ["email", "Correo con dominio propio"], ["mapsUrl", "Enlace al perfil de Google Maps"], ["coordinates", "Coordenadas"]]) {
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
pend.push("Logo reconstruido a partir de una captura de baja resolución: pedir vectorial original al cliente.");
pend.push("Política de privacidad en borrador sin validación legal.");
console.log("Pendientes para lanzar:\n" + pend.map((p) => "  - " + p).join("\n"));
