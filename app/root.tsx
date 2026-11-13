import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction } from "react-router";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/dm-sans";
import frauncesLatin from "@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2?url";
import dmSansLatin from "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?url";
import "./app.css";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { WhatsAppFab } from "~/components/WhatsAppFab";
import { env } from "@/config/site";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/logo-circle.png", type: "image/png" },
  { rel: "apple-touch-icon", href: "/logo-circle.png" },
  // La fuente de títulos (Fraunces) es la del LCP en texto: se precarga.
  { rel: "preload", href: frauncesLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: dmSansLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

const noscriptCss =
  ".site-nav{position:static!important;visibility:visible!important;opacity:1!important;transform:none!important;padding:0 1.25rem 1rem!important}.site-nav .nav-link{font-size:1.1rem;min-height:2.75rem}header button{display:none}";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f7f2e9" />
        {env.noindex && <meta name="robots" content="noindex, nofollow" />}
        <Meta />
        <Links />
        <noscript>
          <style>{noscriptCss}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-forest focus:px-4 focus:py-3 focus:text-cream"
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
    <>
      <Header />
      <main id="contenido">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
