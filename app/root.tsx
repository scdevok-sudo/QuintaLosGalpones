import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/newsreader/wght.css";
import bricolageLatin from "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2?url";
import "./app.css";
import "./motion.css";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { ExpressBar, ExpressProvider } from "~/components/Express";
import { MotionLayer } from "~/components/MotionLayer";
import { env } from "@/config/site";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/logo-circle.png", type: "image/png" },
  { rel: "apple-touch-icon", href: "/logo-circle.png" },
  // Se precarga solo la fuente del H1 (Bricolage Grotesque); el cuerpo usa swap.
  { rel: "preload", href: bricolageLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

const introScript =
  "try{if(!sessionStorage.getItem('qg-intro')){document.documentElement.setAttribute('data-intro','1');sessionStorage.setItem('qg-intro','1')}}catch(e){}";

const noscriptCss =
  ".site-nav{position:static!important;visibility:visible!important;opacity:1!important;transform:none!important;padding:0 1.25rem 1rem!important}.site-nav .nav-link{font-size:1.1rem;min-height:2.75rem}header{position:static!important}header .wrap{height:auto!important;flex-wrap:wrap;padding-block:.5rem}header button.btn-line{display:none}.site-nav{flex-basis:100%}";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
        <meta name="theme-color" content="#e9e6d2" />
        {env.noindex && <meta name="robots" content="noindex, nofollow" />}
        {/* Entrada del hero solo en la primera carga de la sesión. Corre antes del primer pintado. */}
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <Meta />
        <Links />
        <noscript>
          <style>{noscriptCss}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-tinta focus:px-4 focus:py-3 focus:text-tarde"
        >
          Saltar al contenido
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ExpressProvider>
      <Header />
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
      <ExpressBar />
      <MotionLayer />
    </ExpressProvider>
  );
}
