// Lighthouse mobile (throttling por defecto) sobre el build estático servido con `npm run preview`.
// Uso: node scripts/lighthouse-median.mjs [url] [corridas]. Imprime la mediana de cada métrica.
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:4173/";
const n = Number(process.argv[3] || 5);
const dir = mkdtempSync(join(tmpdir(), "lhm-"));
const env = { ...process.env, CHROME_PATH: chromium.executablePath() };
const rows = [];
for (let i = 0; i < n; i++) {
  const out = join(dir, `r${i}.json`);
  try {
    execFileSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["--yes", "lighthouse", url, "--only-categories=performance,accessibility,seo", "--form-factor=mobile",
        "--chrome-flags=--headless=new --no-sandbox", "--output=json", `--output-path=${out}`, "--quiet"],
      { env, stdio: "ignore", shell: process.platform === "win32" },
    );
  } catch {}
  try {
    const r = JSON.parse(readFileSync(out, "utf8"));
    const a = r.audits;
    rows.push({
      perf: Math.round(r.categories.performance.score * 100),
      a11y: Math.round(r.categories.accessibility.score * 100),
      lcp: a["largest-contentful-paint"].numericValue / 1000,
      tbt: a["total-blocking-time"].numericValue,
      cls: a["cumulative-layout-shift"].numericValue,
      fcp: a["first-contentful-paint"].numericValue / 1000,
    });
  } catch {}
}
const med = (k) => {
  const v = rows.map((r) => r[k]).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : NaN;
};
console.log(`${rows.length} corridas, perf por corrida: ${rows.map((r) => r.perf).join(", ")}`);
console.log(`MEDIANA perf=${med("perf")} a11y=${med("a11y")} FCP=${med("fcp").toFixed(2)}s LCP=${med("lcp").toFixed(2)}s TBT=${Math.round(med("tbt"))}ms CLS=${med("cls").toFixed(3)}`);
