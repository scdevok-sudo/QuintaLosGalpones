// Toma la salida de React Router (build/client) y deja `dist/` listo para un servidor estático:
// cada ruta como dist/<ruta>/index.html, más robots.txt y sitemap.xml respetando VITE_NOINDEX.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, "build", "client");
const dist = join(root, "dist");

function loadEnv() {
  const env = { ...process.env };
  for (const f of [".env", ".env.local", ".env.production"]) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2];
    }
  }
  return env;
}

rmSync(dist, { recursive: true, force: true });
cpSync(src, dist, { recursive: true });

// Si alguna ruta salió como `casamientos.html`, la movemos a `casamientos/index.html`.
const routes = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith(".html")) {
      if (name === "index.html") routes.push(full);
      else if (name !== "__spa-fallback.html") {
        const target = join(dir, name.replace(/\.html$/, ""), "index.html");
        mkdirSync(join(dir, name.replace(/\.html$/, "")), { recursive: true });
        renameSync(full, target);
        routes.push(target);
      }
    }
  }
})(dist);
rmSync(join(dist, "__spa-fallback.html"), { force: true });

const env = loadEnv();
const site = (env.VITE_SITE_URL || "https://quintalosgalpones.com").replace(/\/$/, "");
const noindex = env.VITE_NOINDEX !== "false";

const urls = routes
  .map((f) => f.slice(dist.length).split("\\").join("/").replace(/index\.html$/, ""))
  .filter((u) => u !== "/404/")
  .sort();

if (noindex) {
  writeFileSync(join(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
  rmSync(join(dist, "sitemap.xml"), { force: true });
} else {
  writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
  const body = urls.map((u) => `  <url><loc>${site}${u}</loc></url>`).join("\n");
  writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
}

if (existsSync(join(dist, "404", "index.html"))) writeFileSync(join(dist, "404.html"), readFileSync(join(dist, "404", "index.html")));

console.log(`dist/ listo: ${urls.length} rutas (${noindex ? "noindex" : "indexable"})`);
for (const u of urls) console.log("  " + u);
