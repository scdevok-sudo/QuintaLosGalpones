// Falla si en el código aparecen marcas de página generada (BRIEF-V2 sección 4, anexo v2.2 sección 5 y recorte de v2.3).
// Revisa src/ y app/ (tsx, ts, css). Una línea con "tells-ok" queda exenta (ej. backdrop-filter del ::backdrop del diálogo).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const rules = [
  { name: "uppercase", re: /\buppercase\b/ },
  { name: "tracking-widest", re: /tracking-widest/ },
  { name: "font-mono", re: /font-mono|monospace/ },
  { name: "flecha", re: /→/ },
  { name: "raya larga", re: /—/ },
  { name: "punto medio ' · ' en texto", re: /[^\s'"`]\s·\s[^\s'"`]/ },
  { name: "sombra genérica", re: /\bshadow-(md|lg|xl|2xl)\b/ },
  { name: "glassmorphism", re: /backdrop-blur|backdrop-filter/ },
  { name: "negro tintado de reemplazo", re: /#0b0b0b|#111(?![0-9a-f])/i },
  { name: "reveal genérico fade+subir", re: /\.reveal\b|translateY\(16px\)/ },
  { name: "librerías prohibidas", re: /from "(gsap|lenis|three)/ },
  // --- Recorte v2.3: lo que se sacó no vuelve ---
  { name: "carrusel (v2.3: grilla fija)", re: /scroll-snap-type|car-track|car-dot|\b(embla|swiper|keen-slider)\b/ },
  { name: "contador animado (v2.3)", re: /CountUp|count-up|countUp/ },
  { name: "botón magnético (v2.3)", re: /\bmagnetic\b|\bmagnet\b/ },
  { name: "barra solar (v2.3)", re: /sunbar|sun-line|sun-travel|animation-timeline:\s*scroll\(/ },
  { name: "pin del mapa (v2.3)", re: /\.pin\b|pin-drop|className="pin"/ },
  { name: "máscara con vida (v2.3: la máscara es solo del hero)", re: /mask-live|maskLive/ },
  { name: "paneles expandibles de caminos (v2.3)", re: /camino-extra|camino-photo2|camino-[ab]\b|:has\(\.camino/ },
  { name: "consulta modal (v2.3: panel no modal)", re: /showModal\(|dialog\.consulta::backdrop|::backdrop/ },
  { name: "máscara fuera del hero", re: /<Photo\b(?![^>]*slot="hero\.)[^>]*\bmask\b/ },
  { name: "cursor de arrastre", re: /cursor:\s*grab/ },
];

const files = [];
for (const root of ["src", "app"]) {
  (function walk(d) {
    for (const n of readdirSync(d)) {
      const f = join(d, n);
      if (statSync(f).isDirectory()) walk(f);
      else if (/\.(tsx?|css)$/.test(n)) files.push(f);
    }
  })(root);
}

let bad = 0;
const fail = (f, line, name, text) => {
  console.error(`✗ ${f}:${line} ${name}: ${text.trim().slice(0, 90)}`);
  bad++;
};

for (const f of files) {
  const text = readFileSync(f, "utf8");
  text.split(/\r?\n/).forEach((line, i) => {
    if (line.includes("tells-ok")) return;
    for (const r of rules) if (r.re.test(line)) fail(f, i + 1, r.name, line);
  });
}

// --- Reglas de movimiento (CSS) ---------------------------------------------------------------
// Recorre cada CSS con una pila de at-rules para saber en qué @media/@supports está cada regla.
const LAYOUT_PROPS = /\b(width|height|top|left|right|bottom|box-shadow|margin|padding)\b/;
for (const f of files.filter((x) => x.endsWith(".css"))) {
  const css = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const lineOf = (idx) => css.slice(0, idx).split("\n").length;

  // Bloques @keyframes: nombre -> propiedades que animan.
  const keyframes = {};
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let depth = 1;
    let j = m.index + m[0].length;
    const start = j;
    while (depth && j < css.length) {
      if (css[j] === "{") depth++;
      if (css[j] === "}") depth--;
      j++;
    }
    const body = css.slice(start, j - 1);
    const props = new Set([...body.matchAll(/([\w-]+)\s*:/g)].map((p) => p[1]));
    keyframes[m[1]] = { props, line: lineOf(m.index) };
  }

  // (a) keyframes que animan propiedades de layout o box-shadow.
  for (const [name, k] of Object.entries(keyframes)) {
    for (const p of k.props) {
      if (/^(width|height|top|left|right|bottom|box-shadow|margin|padding)/.test(p)) {
        fail(f, k.line, "keyframes de layout (" + p + ")", "@keyframes " + name);
      }
    }
  }

  // (b) Recorrer reglas: pila de contextos.
  const stack = [];
  let buf = "";
  let fadeUp = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === "{") {
      stack.push({ head: buf.trim(), start: i });
      buf = "";
    } else if (c === "}") {
      const ctx = stack.pop();
      const body = css.slice(ctx.start + 1, i);
      const isAtRule = ctx.head.startsWith("@");
      if (!isAtRule && /animation(-name)?\s*:/.test(body) && !/animation\s*:\s*none/.test(body)) {
        const guarded = stack.some((s) => /prefers-reduced-motion:\s*no-preference/.test(s.head));
        const inReduceNone = stack.some((s) => /prefers-reduced-motion:\s*reduce/.test(s.head));
        const name = (body.match(/animation(?:-name)?\s*:\s*([\w-]+)/) || [])[1];
        const insideKeyframes = stack.some((s) => s.head.startsWith("@keyframes"));
        if (!guarded && !inReduceNone && !insideKeyframes) {
          fail(f, lineOf(ctx.start), "animación sin guarda prefers-reduced-motion", ctx.head);
        }
        // (c) animaciones atadas al scroll que mueven layout
        if (/animation-timeline/.test(body) && name && keyframes[name]) {
          for (const p of keyframes[name].props) {
            if (LAYOUT_PROPS.test(p)) fail(f, lineOf(ctx.start), "animación de scroll sobre " + p, ctx.head);
          }
        }
        // (d) mismo fade-up en más de 2 secciones
        if (name && /^(rise|fade-up|reveal)/.test(name)) fadeUp++;
      }
      // transition de layout en reglas atadas a scroll
      if (!isAtRule && /animation-timeline/.test(body) && /transition\s*:[^;]*(width|height|top|left|box-shadow)/.test(body)) {
        fail(f, lineOf(ctx.start), "transition de layout con animation-timeline", ctx.head);
      }
      // v2.3: el hover mueve como mucho 2 px y escala como mucho 1,02.
      if (!isAtRule && /:(hover|focus-within)\b/.test(ctx.head)) {
        for (const m of body.matchAll(/scale\(\s*([\d.]+)/g)) {
          if (parseFloat(m[1]) > 1.02) fail(f, lineOf(ctx.start), "hover con zoom mayor a 1,02", ctx.head + " scale(" + m[1] + ")");
        }
        for (const m of body.matchAll(/translate[XY3d]*\(\s*(-?[\d.]+)px(?:\s*,\s*(-?[\d.]+)px)?/g)) {
          if (Math.max(Math.abs(parseFloat(m[1])), Math.abs(parseFloat(m[2] || "0"))) > 2) {
            fail(f, lineOf(ctx.start), "hover que mueve más de 2 px", ctx.head + " " + m[0]);
          }
        }
      }
      buf = "";
    } else {
      buf += c;
    }
  }
  if (fadeUp > 2) fail(f, 1, "mismo patrón fade-up en más de 2 secciones", String(fadeUp) + " usos");
}

// (e) librería de motion en el bundle inicial: solo se permite importarla desde app/lazy/ o con import().
for (const f of files.filter((x) => /\.tsx?$/.test(x))) {
  const text = readFileSync(f, "utf8");
  const inLazy = f.replace(/\\/g, "/").includes("/lazy/");
  for (const m of text.matchAll(/^\s*import\s[^;]*from\s+["'](motion|motion\/react|framer-motion|gsap|gsap\/[\w]+)["']/gm)) {
    if (!inLazy) fail(f, text.slice(0, m.index).split("\n").length, "librería de motion en el bundle inicial", m[0]);
  }
}

// (f) Tematizado exigido (v2.3): selección, caret, scrollbar y foco definidos en app.css.
{
  const css = readFileSync("app/app.css", "utf8");
  for (const [name, re] of [["::selection", /::selection/], ["caret-color", /caret-color/], ["scrollbar-color", /scrollbar-color/], [":focus-visible", /:focus-visible/]]) {
    if (!re.test(css)) fail("app/app.css", 1, "falta tematizar " + name, "");
  }
}

// (g) Los CTA principales son enlaces reales (funcionan sin JS): ExpressButton renderiza <a href>.
{
  const ex = readFileSync("app/components/Express.tsx", "utf8");
  const btn = ex.slice(ex.indexOf("export function ExpressButton"));
  if (!/<a\s[^>]*href="\/contacto\/#formulario"/.test(btn)) fail("app/components/Express.tsx", 1, "ExpressButton no es un enlace real", "<a href> a /contacto/#formulario");
}

if (bad) {
  console.error(`${bad} marcas encontradas`);
  process.exit(1);
}
console.log(`check:tells OK (${files.length} archivos)`);
