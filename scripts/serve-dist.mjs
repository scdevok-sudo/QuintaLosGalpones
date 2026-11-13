// Servidor estático mínimo para previsualizar dist/ como lo haría OpenLiteSpeed: sin rewrites,
// resuelve /ruta/ a /ruta/index.html y responde 404 real con 404.html si existe.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const dist = join(process.cwd(), process.env.DIST_DIR || "dist");
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml" };

createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  let file = normalize(join(dist, decodeURIComponent(url.pathname)));
  if (!file.startsWith(dist)) file = join(dist, "404.html");
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    const nf = join(dist, "404.html");
    res.writeHead(404, { "content-type": types[".html"] });
    res.end(existsSync(nf) ? readFileSync(nf) : "No encontrado");
    return;
  }
  res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Preview en http://localhost:${port}`));
