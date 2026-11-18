// Verifica que todo enlace interno y ancla resuelva dentro de dist/.
// Las páginas son archivos planos (dist/casamientos.html); la portada es dist/index.html.
// Exporta `findBrokenLinks()` para que check:launch lo reutilice.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export function loadPages(dist = "dist") {
  const pages = new Map();
  for (const n of readdirSync(dist)) {
    if (!n.endsWith(".html")) continue;
    pages.set(n === "index.html" ? "/" : "/" + n.replace(/\.html$/, ""), readFileSync(join(dist, n), "utf8"));
  }
  return pages;
}

export function findBrokenLinks(dist = "dist") {
  const pages = loadPages(dist);
  const broken = new Map();
  for (const [path, html] of pages) {
    for (const m of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
      const href = m[1].replace(/&amp;/g, "&");
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      const [pathPart, hash] = href.split("#");
      const clean = pathPart.split("?")[0];
      const target = clean === "" ? path : clean;
      const isPage = pages.has(target);
      let why = null;
      if (!isPage && !existsSync(join(dist, target))) why = "ruta inexistente";
      else if (hash && isPage && !new RegExp(`id="${hash}"`).test(pages.get(target))) why = "ancla inexistente";
      if (why) broken.set(`${path} → ${href} (${why})`, true);
    }
  }
  return { pages: [...pages.keys()], broken: [...broken.keys()] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { pages, broken } = findBrokenLinks();
  for (const b of broken) console.error("✗ " + b);
  if (broken.length) {
    console.error(`${broken.length} enlaces rotos`);
    process.exit(1);
  }
  console.log(`check:links OK (${pages.length} páginas)`);
}
