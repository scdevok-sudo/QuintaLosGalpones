// URLs sin barra final: /ruta/ redirige 301 a /ruta, /ruta responde 200, el canonical y el sitemap usan la forma sin barra.
// Uso: npm run preview (otra terminal) y `node scripts/check-routes.mjs`. Contra un servidor real: BASE_URL=https://dominio.
import { readdirSync, existsSync, readFileSync } from "node:fs";

const base = (process.env.BASE_URL || "http://localhost:4173").replace(/\/$/, "");
const rutas = readdirSync("dist").filter((f) => f.endsWith(".html") && !["index.html", "404.html"].includes(f)).map((f) => "/" + f.replace(/\.html$/, ""));
let bad = 0;
const ok = (c, msg) => { console.log((c ? "OK  " : "MAL ") + msg); if (!c) bad++; };
const get = (p, opts = {}) => fetch(base + p, { redirect: "manual", ...opts });

const home = await get("/");
ok(home.status === 200, `/ responde ${home.status}`);
ok(/rel="canonical" href="[^"]*\/"/.test(await home.text()), "/ tiene canonical con la raíz");

for (const r of rutas) {
  const conBarra = await get(r + "/");
  const loc = conBarra.headers.get("location") || "";
  ok(conBarra.status === 301 && new URL(loc, base).pathname === r, `${r}/ -> 301 -> ${loc || "(sin Location)"}`);
  const sinBarra = await get(r);
  const html = await sinBarra.text();
  ok(sinBarra.status === 200, `${r} responde ${sinBarra.status}`);
  const canon = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1] || "";
  ok(canon.endsWith(r) && !canon.endsWith("/"), `${r}: canonical ${canon}`);
  const og = (html.match(/property="og:url" content="([^"]+)"/) || [])[1] || "";
  ok(og === canon, `${r}: og:url coincide con el canonical`);
  const conSlash = [...html.matchAll(/<a [^>]*href="(\/[a-z][^"#?]*\/)(?:[#?"][^"]*)?"/g)].map((m) => m[1]);
  ok(conSlash.length === 0, `${r}: sin enlaces internos con barra final ${conSlash.join(", ")}`);
}
const nf = await get("/no-existe");
ok(nf.status === 404, `/no-existe responde ${nf.status}`);
const css = (readFileSync("dist/index.html", "utf8").match(/href="(\/assets\/[^"]+\.css)"/) || [])[1];
const c = await get(css, { headers: { "accept-encoding": "gzip" } });
ok(c.headers.get("content-encoding") === "gzip", "el CSS se sirve comprimido");

if (existsSync("dist/sitemap.xml")) {
  const locs = [...readFileSync("dist/sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  ok(locs.every((p) => p === "/" || !p.endsWith("/")), `sitemap sin barra final: ${locs.join(" ")}`);
  ok(rutas.every((r) => locs.includes(r)), "el sitemap lista todas las páginas");
} else console.log("--  sin sitemap.xml (VITE_NOINDEX=true): para probarlo, construir con VITE_NOINDEX=false");
process.exit(bad ? 1 : 0);
