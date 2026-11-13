// Falla si en el código aparecen marcas de página generada (BRIEF-V2, sección 4).
// Revisa src/ y app/ (tsx, ts, css).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const rules = [
  { name: "uppercase", re: /\buppercase\b/ },
  { name: "tracking-widest", re: /tracking-widest/ },
  { name: "font-mono", re: /font-mono|monospace/ },
  { name: "flecha →", re: /→/ },
  { name: "raya larga —", re: /—/ },
  { name: "punto medio ' · ' en texto", re: /[^\s'"`]\s·\s[^\s'"`]/ },
  { name: "sombra genérica", re: /\bshadow-(md|lg|xl|2xl)\b/ },
  { name: "backdrop-blur (glassmorphism)", re: /backdrop-blur|backdrop-filter/ },
  { name: "negro tintado de reemplazo", re: /#0b0b0b|#111(?![0-9a-f])/i },
  { name: "reveal fade+subir", re: /\.reveal\b|translateY\(16px\)/ },
  { name: "librerías prohibidas", re: /from "(gsap|lenis|three)/ },
];

const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    if (statSync(f).isDirectory()) walk(f);
    else if (/\.(tsx?|css)$/.test(n)) files.push(f);
  }
})("src");
(function walk(d) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    if (statSync(f).isDirectory()) walk(f);
    else if (/\.(tsx?|css)$/.test(n)) files.push(f);
  }
})("app");

let bad = 0;
for (const f of files) {
  readFileSync(f, "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      for (const r of rules) {
        if (r.re.test(line)) {
          console.error(`✗ ${f}:${i + 1} ${r.name}: ${line.trim().slice(0, 90)}`);
          bad++;
        }
      }
    });
}
if (bad) {
  console.error(`${bad} marcas encontradas`);
  process.exit(1);
}
console.log(`check:tells OK (${files.length} archivos)`);
