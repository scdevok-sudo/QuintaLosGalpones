// Servidor estático mínimo que replica las reglas de rewrite del README (OpenLiteSpeed / Apache):
//   1) /ruta/  ->  301  ->  /ruta   (forma canónica sin barra final; la portada "/" no se toca)
//   2) /ruta   ->  dist/ruta.html   (cada página prerenderizada es un archivo plano)
//   3) lo que no existe responde 404 real con 404.html
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";
import { oldQuery, redirects } from "./redirects.mjs";

const dist = join(process.cwd(), process.env.DIST_DIR || "dist");
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml" };
const isFile = (p) => existsSync(p) && statSync(p).isFile();

createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const path = decodeURIComponent(url.pathname);

  // Mapa de redirecciones del WordPress anterior (scripts/redirects.mjs).
  const rule = redirects.find((r) => r.from.test(path));
  if (rule) {
    res.writeHead(rule.status, rule.to ? { location: rule.to } : {});
    res.end(rule.to ? "" : "Gone");
    return;
  }
  if (path === "/" && oldQuery.test(url.search)) {
    res.writeHead(301, { location: "/" });
    res.end();
    return;
  }

  if (path.length > 1 && path.endsWith("/")) {
    res.writeHead(301, { location: path.replace(/\/+$/, "") + url.search });
    res.end();
    return;
  }

  let file = normalize(join(dist, path === "/" ? "index.html" : path));
  if (!file.startsWith(dist)) file = "";
  if (!isFile(file) && isFile(file + ".html")) file += ".html";

  if (!file || !isFile(file)) {
    const nf = join(dist, "404.html");
    res.writeHead(404, { "content-type": types[".html"] });
    res.end(existsSync(nf) ? readFileSync(nf) : "No encontrado");
    return;
  }
  // Como en producción (OpenLiteSpeed comprime el texto): gzip para html, js, css, svg, json y xml.
  const type = types[extname(file)] || "application/octet-stream";
  const body = readFileSync(file);
  if (/text|javascript|json|xml|svg/.test(type) && /gzip/.test(req.headers["accept-encoding"] || "")) {
    res.writeHead(200, { "content-type": type, "content-encoding": "gzip", vary: "accept-encoding" });
    res.end(gzipSync(body));
    return;
  }
  res.writeHead(200, { "content-type": type });
  res.end(body);
}).listen(port, () => console.log(`Preview en http://localhost:${port}`));
