// Falla si en dist/ aparece texto interno del documento o datos sin confirmar.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const banned = [
  "Seleccionar fotografías", "base de información", "Definiciones pendientes", "Piezas visuales",
  "Ruta sugerida", "Título SEO", "Descripción SEO", "Michelini", "Hotmail", "Agregar enlace",
  "Publicar esta sección", "Botón ", "200 vehículos", "all inclusive", "350", "Agregar teléfono",
  "Mantener opcionales", "—",
];
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    if (statSync(f).isDirectory()) walk(f);
    else if (/\.(html|txt|xml)$/.test(n)) files.push(f);
  }
})("dist");

let bad = 0;
for (const f of files) {
  const t = readFileSync(f, "utf8");
  for (const b of banned) if (t.includes(b)) { console.error(`✗ "${b}" en ${f}`); bad++; }
}
if (bad) process.exit(1);
console.log(`check:content OK (${files.length} archivos)`);
