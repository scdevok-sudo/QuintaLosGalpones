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

// Diferir el JS (anexo v2.3). El script de módulo en línea de React Router descarga y evalúa todo apenas
// carga la página y compite con el primer pintado (la foto del hero es el LCP). Lo reemplazamos por un
// cargador mínimo:
//  1. Precarga el módulo de React Router (entry.client + el chunk de React que comparte) con
//     pointerdown, touchstart o focus sobre un CTA: ese toque ya pagó la descarga cuando llega el clic.
//  2. Carga el resto (manifest, rutas, hidratación) en requestIdleCallback con tope de 2 s, después de `load` y
//     de que el navegador reportó el LCP (la foto del hero), así la hidratación no compite con el LCP.
//  3. Los CTA de consulta son botones `popovertarget`: el panel está en el HTML y abre sin JS ni hidratación
//     (sin JS muestra el botón de WhatsApp). El clic en un CTA adelanta la carga para tener pronto los pasos.
for (const file of routes) {
  let html = readFileSync(file, "utf8");
  const preload = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)"/g)].map((m) => m[1]);
  const router = preload.filter((h) => /\/(entry\.client|jsx-runtime)-/.test(h));
  html = html.replace(/<link rel="modulepreload"[^>]*>/g, "");
  let loaderTag = "";
  html = html.replace(/<script type="module" async="">([\s\S]*?)<\/script>/, (_m, code) => {
    const loader =
      "(function(){var code=" + JSON.stringify(code) + ",router=" + JSON.stringify(router) + ",done=0,pre=0,w=window;" +
      "function go(){if(done)return;done=1;var s=document.createElement('script');s.type='module';s.textContent=code;document.body.appendChild(s)}" +
      "function warm(){if(pre)return;pre=1;router.forEach(function(h){var l=document.createElement('link');l.rel='modulepreload';l.href=h;document.head.appendChild(l)})}" +
      "function cta(e){var t=e.target;return t&&t.closest?t.closest('[data-express],a.btn'):null}" +
      "function hot(e){if(!w.__qgReady&&cta(e))warm()}" +
      "addEventListener('pointerdown',hot,{passive:true,capture:true});" +
      "addEventListener('touchstart',hot,{passive:true,capture:true});" +
      "addEventListener('focusin',hot,true);" +
      "addEventListener('click',function(e){if(!w.__qgReady&&cta(e)){warm();go()}},true);" +
      "var lcp=0,t0=0;try{new PerformanceObserver(function(l){if(l.getEntries().length)lcp=1}).observe({type:'largest-contentful-paint',buffered:true})}catch(e){lcp=1}" +
      "function idle(){if(!t0)t0=Date.now();if(!lcp&&Date.now()-t0<2000){setTimeout(idle,100);return}(w.requestIdleCallback||function(f){setTimeout(f,200)})(go,{timeout:2000})}" +
      "if(document.readyState==='complete')idle();else addEventListener('load',idle,{once:true})})();";
    loaderTag = "<script>" + loader + "</script>";
    // Queda un <script> vacío en el mismo lugar: React espera un <script> ahí al hidratar (sin él, error 418).
    return "<script></script>";
  });
  // El cargador va al principio del <head>: así ya escucha los toques aunque el CTA se vea antes de que
  // termine de llegar el resto del HTML.
  if (loaderTag) html = html.replace(/<head[^>]*>/, (m) => m + loaderTag);
  writeFileSync(file, html);
}

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
