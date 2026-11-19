// photos:upscale: Nivel B. Agranda hasta 2x con Real-ESRGAN (realesrgan-ncnn-vulkan, modelo realesrgan-x4plus) las fotos
// elegibles: sin rostros en primer plano y de menos de 2000 px. Solo genera candidatas en .photos-upscaled/ (fuera de git) y
// las hojas de antes y después en docs/fotos/mejoras/nivel-b/. NO se aplica nada: photos:build solo usa una candidata si la
// foto lleva "mejora": { "nivelB": "aplicar" } en photos.config.json (aprobación explícita).
// La herramienta vive fuera del repo: REALESRGAN_DIR o C:/Users/<usuario>/tools/realesrgan.
// Uso: node scripts/photos-upscale.mjs [F0xx ...]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const dir = process.env.REALESRGAN_DIR || join(homedir(), "tools", "realesrgan");
const exe = join(dir, "realesrgan-ncnn-vulkan.exe");
if (!existsSync(exe)) {
  console.error(`No está realesrgan-ncnn-vulkan en ${dir} (ver docs/INFORME-ESCRITORIO.md).`);
  process.exit(1);
}
const cfg = JSON.parse(readFileSync("photos.config.json", "utf8"));
const manifest = JSON.parse(readFileSync("src/data/photos.manifest.json", "utf8"));
const only = process.argv.slice(2);
const OUT = ".photos-upscaled";
const DOC = "docs/fotos/mejoras/nivel-b";
mkdirSync(OUT, { recursive: true });
mkdirSync(DOC, { recursive: true });
mkdirSync(".photos-work", { recursive: true });
const esc = (t) => String(t).replace(/[<>&"]/g, "");
const label = (t, w, h = 24, size = 14, fg = "#fff") => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><text x="6" y="${h - 7}" font-size="${size}" font-family="Arial" fill="${fg}">${esc(t)}</text></svg>`);
const rows = [];
for (const m of manifest) {
  if (m.seccion === "og" || !m.proceso?.nivelB?.elegible || (only.length && !only.includes(m.id))) continue;
  const f = cfg.fotos.find((x) => x.id === m.id);
  const norm = join(".photos-work", `${m.id}.in.png`);
  await sharp(join(cfg.fuente, f.original), { failOn: "none" }).rotate().withIccProfile("srgb").png({ compressionLevel: 1 }).toFile(norm);
  const x4 = join(OUT, `${m.id}-x4.png`);
  const x2 = join(OUT, `${m.id}-x2.png`);
  const t0 = Date.now();
  execFileSync(exe, ["-i", norm, "-o", x4, "-n", "realesrgan-x4plus", "-s", "4", "-f", "png", "-m", join(dir, "models")], { stdio: "ignore" });
  const { w, h } = m.dimensionesOriginal;
  await sharp(x4).resize(w * 2, h * 2, { kernel: "lanczos3" }).png({ compressionLevel: 3 }).toFile(x2);
  console.log(m.id, `${w}x${h} -> ${w * 2}x${h * 2}`, `${Math.round((Date.now() - t0) / 1000)} s`);
  // Hoja: mismo detalle al 100 % del resultado (2x): ampliación clásica (Lanczos) contra IA.
  const classic = await sharp(norm).resize(w * 2, h * 2, { kernel: "lanczos3" }).toBuffer();
  const sub = m.subject;
  const dw = 520;
  const dh = 360;
  const cx = Math.round(((sub.x0 + sub.x1) / 2) * w * 2);
  const cy = Math.round(((sub.y0 + sub.y1) / 2) * h * 2);
  const ex = { left: Math.max(0, Math.min(w * 2 - dw, cx - dw / 2)), top: Math.max(0, Math.min(h * 2 - dh, cy - dh / 2)), width: dw, height: dh };
  const ex2 = { left: Math.max(0, Math.min(w * 2 - dw, cx - dw / 2 + 0)), top: Math.max(0, Math.min(h * 2 - dh, Math.round(((sub.y0 * 0.4 + sub.y1 * 0.6)) * h * 2) - dh / 2)), width: dw, height: dh };
  const cut = (b, e) => sharp(b).extract(e).jpeg({ quality: 92 }).toBuffer();
  const W = 400;
  const Hh = Math.round((W * h) / w);
  const whole = (b, resize) => sharp(b).resize(W, Hh).jpeg({ quality: 85 }).toBuffer();
  const [c1, a1, c2, a2] = [await cut(classic, ex), await cut(x2, ex), await cut(classic, ex2), await cut(x2, ex2)];
  const width = dw * 2 + 30;
  const height = 30 + dh * 2 + 100;
  await sharp({ create: { width, height, channels: 3, background: "#151d18" } })
    .composite([
      { input: label(`${m.id} ${m.nombre}  |  ${w}x${h} -> ${w * 2}x${h * 2}  |  detalles al 100 % del resultado 2x`, width, 26, 16, "#ffb347"), left: 0, top: 2 },
      { input: label("ampliación clásica 2x (Lanczos)", dw, 22, 13, "#bbb"), left: 0, top: 30 },
      { input: c1, left: 0, top: 54 },
      { input: label("Real-ESRGAN 2x", dw, 22, 13, "#8f8"), left: dw + 30, top: 30 },
      { input: a1, left: dw + 30, top: 54 },
      { input: c2, left: 0, top: 60 + dh },
      { input: a2, left: dw + 30, top: 60 + dh },
    ])
    .jpeg({ quality: 84 })
    .toFile(`${DOC}/${m.id}.jpg`);
  rows.push({ id: m.id, nombre: m.nombre, w, h });
}
if (rows.length) writeFileSync(`${DOC}/.generadas.json`, JSON.stringify(rows, null, 1));
console.log(`${rows.length} candidatas en ${OUT}/ (fuera de git). Nada aplicado.`);
