// og:build genera una imagen Open Graph 1200x630 JPEG por página principal a partir de las fotos ya procesadas
// (public/photos, la misma que usa cada slot), con el logo en blanco abajo a la izquierda sobre un degradé oscuro para
// que se lea en cualquier foto: es lo que se ve al compartir el link. Escribe public/og/*.jpg. Sin EXIF. Uso: npm run og:build
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import sharp from "sharp";

const manifest = JSON.parse(readFileSync("src/data/photos.manifest.json", "utf8"));
const slots = JSON.parse(readFileSync("src/data/photos.slots.json", "utf8"));
// página -> slot que aporta la foto. Empresas no tiene foto propia procesada todavía: usa la de llegada.
const PAGES = {
  default: "hero.principal",
  inicio: "hero.principal",
  casamientos: "casamientos.hero",
  espacios: "espacios.hero",
  empresas: "story.llegada",
  contacto: "contacto.hero",
};
mkdirSync("public/og", { recursive: true });
// Logo (blanco, 1600x337) a 380 px de ancho; degradé oscuro en el tercio inferior.
const logo = await sharp("public/brand/logo-blanco.png").resize({ width: 380 }).png().toBuffer();
const logoH = (await sharp(logo).metadata()).height;
const degrade = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#14100b" stop-opacity="0"/><stop offset="1" stop-color="#14100b" stop-opacity="0.82"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`,
);
for (const [page, slot] of Object.entries(PAGES)) {
  const cfg = slots[slot];
  const m = manifest.find((x) => x.id === cfg?.foto && x.seccion !== "og");
  if (!m) { console.error(`✗ ${page}: el slot ${slot} no tiene foto procesada`); process.exitCode = 1; continue; }
  const file = `public/photos/${m.nombre}-w${m.jpeg.width}.jpg`;
  if (!existsSync(file)) { console.error(`✗ ${page}: falta ${file}`); process.exitCode = 1; continue; }
  const meta = await sharp(file).metadata();
  const fx = m.focal?.x ?? 0.5, fy = m.focal?.y ?? 0.5;
  // recorte 1200:630 alrededor del punto focal, sobre la imagen ya recortada del slot
  const ch = Math.min(meta.height, Math.round(meta.width * 630 / 1200));
  const cw = Math.min(meta.width, Math.round(ch * 1200 / 630));
  const left = Math.round(Math.min(Math.max(fx * meta.width - cw / 2, 0), meta.width - cw));
  const top = Math.round(Math.min(Math.max(fy * meta.height - ch / 2, 0), meta.height - ch));
  await sharp(file).extract({ left, top, width: cw, height: ch }).resize(1200, 630)
    .composite([{ input: degrade }, { input: logo, left: 56, top: 630 - 48 - logoH }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`public/og/${page}.jpg`);
  console.log(`og/${page}.jpg <- ${m.id} (${slot})`);
}
