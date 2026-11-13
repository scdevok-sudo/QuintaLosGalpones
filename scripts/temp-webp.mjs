// Convierte las fotos provisorias (public/photos-temp/*.jpg) a WebP liviano para el preview.
// No es el pipeline de la Fase 2 (AVIF/WebP en 4 tamaños, sin EXIF): solo evita medir con JPG pesados.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const dir = "public/photos-temp";
for (const f of readdirSync(dir).filter((n) => n.endsWith(".jpg"))) {
  const out = join(dir, f.replace(/\.jpg$/, ".webp"));
  const info = await sharp(join(dir, f)).rotate().webp({ quality: 66, effort: 5 }).toFile(out);
  console.log(f, "->", Math.round(info.size / 1024) + " KB");
}
