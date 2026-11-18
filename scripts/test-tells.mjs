// Prueba negativa de check:tells: cada muestra rompe UNA regla y el chequeo tiene que fallar nombrándola.
// También verifica que un archivo limpio pase y que los comentarios no den falsos positivos.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const casos = [
  ["transition: all", "a.css", ".a { transition: all 200ms var(--ease-out); }", "transition: all"],
  ["transition-all (tailwind)", "a.tsx", 'const a = <div className="transition-all" />;', "transition: all"],
  ["scale(0)", "a.css", "@starting-style { .a { transform: scale(0); } }", "scale(0)"],
  ["scale-0 (tailwind)", "a.tsx", 'const a = <div className="scale-0" />;', "scale(0)"],
  ["ease-in", "a.css", ".a { transition: opacity 200ms ease-in; }", "ease-in"],
  ["ease-in (tailwind)", "a.tsx", 'const a = <div className="ease-in" />;', "ease-in"],
  ["hover fuera de la media query", "a.css", ".a:hover { opacity: 0.5; }", "hover fuera de @media"],
  ["tracking menor a -0.04em", "a.css", ".a { letter-spacing: -0.06em; }", "tracking menor"],
  ["máscara fuera del hero y del cubierto", "a.tsx", 'const a = <Photo slot="espacios.parque" mask />;', "máscara fuera del hero"],
  ["carrusel", "a.css", ".a { scroll-snap-type: x mandatory; }", "carrusel"],
  ["caption bajo una imagen", "a.tsx", 'const a = <figure><Photo slot="x" /><figcaption>Pie</figcaption></figure>;', "caption bajo una imagen"],
  ["caption en el contenido", "a.ts", 'export const x = { caption: "Pie de foto" };', "caption bajo una imagen"],
  ["sombra halo (box-shadow)", "a.css", ".a { box-shadow: 0 0 12px rgb(255 179 71 / 0.5); }", "sombra como halo"],
  ["sombra halo (drop-shadow)", "a.css", ".a { filter: drop-shadow(0 0 5px #fff); }", "sombra como halo"],
  ["texto con gradiente", "a.css", ".a { background: linear-gradient(#f00, #00f); background-clip: text; }", "texto con gradiente"],
  ["texto con gradiente (tailwind)", "a.tsx", 'const a = <h1 className="bg-clip-text" />;', "texto con gradiente"],
];
const limpios = [
  ["comentarios que nombran lo prohibido", "a.css", "/* nunca ease-in ni transition: all ni scale(0) */\n.a { transition: opacity 150ms var(--ease-out); }"],
  ["hover dentro de la media query", "a.css", "@media (hover: hover) and (pointer: fine) { .a:hover { opacity: 0.5; } }"],
  ["sombra con offset", "a.css", ".a { box-shadow: 0 -8px 28px rgb(0 0 0 / 0.2); }"],
  ["figcaption de una cita (sin foto)", "a.tsx", "const a = <figure><blockquote>x</blockquote><figcaption>Ana</figcaption></figure>;"],
  ["tracking de -0.04em permitido", "a.css", ".a { letter-spacing: -0.04em; }"],
  ["máscara en el espacio cubierto", "a.tsx", 'const a = <Photo later slot="espacios.cubierto" mask />;'],
  ["máscara en el hero de Inicio", "a.tsx", 'const a = <Photo slot="hero.principal" mask priority />;'],
  ["ease-in-out permitido", "a.css", ".a { transition: transform 300ms ease-in-out; }"],
];

let mal = 0;
const run = (nombre, archivo, codigo) => {
  const dir = mkdtempSync(join(tmpdir(), "tells-"));
  mkdirSync(join(dir, "app"));
  writeFileSync(join(dir, "app", archivo), codigo);
  const r = spawnSync(process.execPath, ["scripts/check-tells.mjs"], { env: { ...process.env, TELLS_ROOTS: join(dir, "app") }, encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  return r;
};
for (const [nombre, archivo, codigo, esperado] of casos) {
  const r = run(nombre, archivo, codigo);
  const ok = r.status !== 0 && r.stderr.includes(esperado);
  console.log((ok ? "OK  falla " : "MAL no falla ") + nombre);
  if (!ok) mal++;
}
for (const [nombre, archivo, codigo] of limpios) {
  const r = run(nombre, archivo, codigo);
  const ok = r.status === 0;
  console.log((ok ? "OK  pasa  " : "MAL falla ") + nombre + (ok ? "" : ": " + r.stderr.trim()));
  if (!ok) mal++;
}
process.exit(mal ? 1 : 0);
