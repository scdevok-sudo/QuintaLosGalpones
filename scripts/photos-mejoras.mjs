// photos:mejoras: hojas de antes y después por foto (Nivel A) con la recomendación, en docs/fotos/mejoras/.
// Antes = recorte del original sin tocar; después = mismo recorte con el proceso registrado en el manifiesto.
// Uso: node scripts/photos-mejoras.mjs   (después de npm run photos:build)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const cfg = JSON.parse(readFileSync("photos.config.json", "utf8"));
const manifest = JSON.parse(readFileSync("src/data/photos.manifest.json", "utf8"));
const A = cfg.mejora.nivelA;
const OUT = "docs/fotos/mejoras";
const WORK = ".photos-work";
mkdirSync(OUT, { recursive: true });
mkdirSync(WORK, { recursive: true });
const esc = (t) => String(t).replace(/[<>&"]/g, "");
const label = (t, w, h = 26, size = 16, fg = "#fff") => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><text x="6" y="${h - 8}" font-size="${size}" font-family="Arial" fill="${fg}">${esc(t)}</text></svg>`);
const rows = [];
for (const m of manifest) {
  if (m.seccion === "og" || m.generada === false || m.estado === "bloqueada" || !m.proceso?.nivelA?.aplicado) continue;
  const f = cfg.fotos.find((x) => x.id === m.id);
  let file = join(cfg.fuente, f.original);
  if (/\.hei[cf]$/i.test(file)) {
    const mid = `${WORK}/${m.id}.png`;
    if (!existsSync(mid)) execFileSync("python", ["-I", "scripts/heic-to-png.py", file, mid]);
    file = mid;
  }
  const src = await sharp(file, { failOn: "none" }).rotate().withIccProfile("srgb").png({ compressionLevel: 1 }).toBuffer();
  const inF = `${WORK}/${m.id}.src.png`;
  const outF = `${WORK}/${m.id}.enh.png`;
  writeFileSync(inF, src);
  const p = m.proceso.nivelA;
  const r = JSON.parse(execFileSync("python", ["-I", "scripts/enhance.py", "apply", inF, outF, `h=${p.reduccionRuido ?? 0}`, `ev=${p.exposicionEV ?? 0}`, `wb=${(p.balanceColor ?? [1, 1, 1]).join(",")}`, "maxw=2000"], { encoding: "utf8" }));
  const enh = readFileSync(outF);
  // Recorte que se publica (el primero de escritorio si existe, si no el base).
  const art = Object.values(m.art ?? {}).find((a) => a.bp === "desktop");
  const box = art ? art.box : { left: m.recorte.left, top: m.recorte.top, width: m.recorte.w, height: m.recorte.h };
  const k = r.escala;
  const eb = { left: Math.round(box.left * k), top: Math.round(box.top * k), width: Math.min(Math.round(box.width * k), r.ancho - Math.round(box.left * k)), height: Math.min(Math.round(box.height * k), r.alto - Math.round(box.top * k)) };
  const W = 520;
  const H = Math.round((W * box.height) / box.width);
  const before = await sharp(src).extract(box).resize(W, H).jpeg({ quality: 88 }).toBuffer();
  const afterBig = await sharp(enh).extract(eb).resize(box.width < 2000 ? box.width : 2000).sharpen(A.sharpen).toBuffer();
  const beforeBig = await sharp(src).extract(box).resize(box.width < 2000 ? box.width : 2000).toBuffer();
  const after = await sharp(afterBig).resize(W, H).jpeg({ quality: 88 }).toBuffer();
  // Detalle al 100 % (centro del sujeto).
  const bm = await sharp(beforeBig).metadata();
  const dw = Math.min(480, bm.width);
  const dh = 300;
  const sx = Math.max(0, Math.min(bm.width - dw, Math.round((m.subject.x0 + m.subject.x1) / 2 * m.dimensionesOriginal.w - box.left - dw / 2)));
  const sy = Math.max(0, Math.min(bm.height - dh, Math.round((m.subject.y0 + m.subject.y1) / 2 * m.dimensionesOriginal.h - box.top - dh / 2)));
  const det = (b) => sharp(b).extract({ left: sx, top: sy, width: dw, height: dh }).jpeg({ quality: 90 }).toBuffer();
  const [db, da] = [await det(beforeBig), await det(afterBig)];
  const cambio = p.cambioMedio;
  const fuerte = Math.abs(p.exposicionEV ?? 0) >= A.evMax - 0.001;
  const rec = cambio > 6 && fuerte ? "no aplicar" : "aplicar";
  const motivo = rec === "aplicar"
    ? `cambio medio ${cambio}/255; ${p.reduccionRuido ? "ruido reducido; " : "sin ruido que reducir; "}EV ${p.exposicionEV}; enfoque suave`
    : `la corrección de exposición llega al tope (EV ${p.exposicionEV}) y cambia el clima de la foto (cambio medio ${cambio}/255): conviene revisarla con el cliente antes`;
  const width = W * 2 + 30;
  const height = 30 + H + 30 + dh + 60;
  const comp = [
    { input: label(`${m.id} ${m.nombre}  |  ${m.dimensionesOriginal.w}x${m.dimensionesOriginal.h}  |  recomendación: ${rec.toUpperCase()}`, width, 26, 17, rec === "aplicar" ? "#8f8" : "#f88"), left: 0, top: 2 },
    { input: label("ANTES (original sin tocar)", W, 22, 14, "#ffb347"), left: 0, top: 30 },
    { input: before, left: 0, top: 52 },
    { input: label("DESPUÉS (Nivel A)", W, 22, 14, "#ffb347"), left: W + 30, top: 30 },
    { input: after, left: W + 30, top: 52 },
    { input: label("detalle al 100 %: antes", W, 22, 13, "#bbb"), left: 0, top: 56 + H },
    { input: db, left: 0, top: 78 + H },
    { input: label("detalle al 100 %: después", W, 22, 13, "#bbb"), left: W + 30, top: 56 + H },
    { input: da, left: W + 30, top: 78 + H },
    { input: label(motivo.slice(0, 150), width, 24, 13, "#ccc"), left: 0, top: 84 + H + dh },
  ];
  await sharp({ create: { width, height, channels: 3, background: "#151d18" } }).composite(comp).jpeg({ quality: 82 }).toFile(`${OUT}/${m.id}.jpg`);
  rows.push({ id: m.id, nombre: m.nombre, orig: `${m.dimensionesOriginal.w}x${m.dimensionesOriginal.h}`, ruido: p.ruidoEstimado, h: p.reduccionRuido, ev: p.exposicionEV, wb: p.balanceColor.join("/"), cambio, rec, motivo, B: m.proceso.nivelB });
  console.log(m.id, rec, cambio);
}
const md = `# Mejora técnica de fotos: antes y después

Una hoja por foto (\`<ID>.jpg\`): a la izquierda el original sin tocar, a la derecha el mismo recorte con el Nivel A, y el detalle al 100 %.
Los originales no se modifican. Se regeneran con \`npm run photos:build\` y \`node scripts/photos-mejoras.mjs\`.

## Nivel A (aplicado a todas)
Reducción de ruido leve (solo si el ruido estimado supera ${A.sigmaMin}), enfoque suave al tamaño final y exposición y color consistentes entre fotos (ajuste de hasta ±${A.evMax} EV y ±${A.wbMax * 100} % de color hacia la mediana del grupo). No quita ni agrega objetos, luces, personas ni cielos; no retoca manchas. La barrera de \`photos:build\` y \`photos:verify\` falla si el cambio medio supera ${A.cambioMax}/255.

| Foto | Original | Ruido estimado | Reducción de ruido | Exposición (EV) | Color R/G/B | Cambio medio | Recomendación |
|---|---|---|---|---|---|---|---|
${rows.map((r) => `| [${r.id}](${r.id}.jpg) | ${r.orig} | ${r.ruido} | ${r.h || "no"} | ${r.ev} | ${r.wb} | ${r.cambio} | **${r.rec}** |`).join("\n")}

${rows.filter((r) => r.rec !== "aplicar").map((r) => `- **${r.id}** (no aplicar): ${r.motivo}`).join("\n")}

## Nivel B (agrandado con IA hasta 2x): generado solo si lo aprobás, no aplicado
Pendiente: no hay herramienta instalada (ver INFORME-ESCRITORIO.md). Fotos elegibles (sin rostros en primer plano y menos de 2000 px): ${rows.filter((r) => r.B?.elegible).map((r) => r.id).join(", ")}. Excluidas por tener rostros: ${manifest.filter((m) => m.proceso?.nivelB?.motivo === "hay rostros").map((m) => m.id).join(", ")}.
`;
writeFileSync(`${OUT}/README.md`, md);
