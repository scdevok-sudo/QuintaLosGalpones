// Verifica que todo enlace interno y ancla resuelva dentro de dist/.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const pages = new Map();
(function walk(d) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    if (statSync(f).isDirectory()) walk(f);
    else if (n === "index.html") pages.set(("/" + f.slice(5).split("\\").join("/")).replace(/index\.html$/, ""), readFileSync(f, "utf8"));
  }
})("dist");

let bad = 0;
for (const [path, html] of pages) {
  for (const m of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, "&");
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const [pathPart, hash] = href.split("#");
    const clean = pathPart.split("?")[0];
    const target = clean === "" ? path : clean;
    const isPage = pages.has(target);
    if (!isPage && !existsSync(join("dist", target))) { console.error(`✗ ${path} → ${href} (ruta inexistente)`); bad++; continue; }
    if (hash && isPage && !new RegExp(`id="${hash}"`).test(pages.get(target))) { console.error(`✗ ${path} → ${href} (ancla inexistente)`); bad++; }
  }
}
if (bad) { console.error(`${bad} enlaces rotos`); process.exit(1); }
console.log(`check:links OK (${pages.size} páginas)`);
