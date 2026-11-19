import { env, site } from "@/config/site";
import type { Meta } from "@/content/types";

export const absoluteUrl = (path: string) =>
  `${env.siteUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

type Descriptor = Record<string, unknown>;

/** Imagen Open Graph por defecto (JPEG 1200×630, foto con el logo): la genera npm run og:build en public/og. */
const OG_PATH = "/og/default.jpg";

/** Meta tags estándar de una ruta: título, descripción, canonical, Open Graph y Twitter. */
export function pageMeta(meta: Meta, extra: Descriptor[] = []): Descriptor[] {
  const url = absoluteUrl(meta.path);
  // Páginas principales: su propia imagen (npm run og:build). El resto usa la genérica.
  const image = absoluteUrl(meta.og ? `/og/${meta.og}.jpg` : OG_PATH);
  return [
    { title: meta.title },
    { name: "description", content: meta.description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "es_AR" },
    { property: "og:site_name", content: site.name },
    { property: "og:title", content: meta.title },
    { property: "og:description", content: meta.description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: `${site.name}: logo sobre una foto del parque` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: meta.title },
    { name: "twitter:description", content: meta.description },
    { name: "twitter:image", content: image },
    ...extra,
  ];
}

/** LocalBusiness con solo datos validados. Sin aggregateRating ni reseñas propias. */
export function localBusinessLd(): Descriptor {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EventVenue"],
    "@id": `${absoluteUrl("/")}#negocio`,
    name: site.name,
    url: absoluteUrl("/"),
    image: absoluteUrl(OG_PATH),
    description: "Quinta para casamientos y eventos de empresa en Benavídez, provincia de Buenos Aires.",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      addressLocality: site.locality,
      addressRegion: "Buenos Aires",
      addressCountry: site.country,
    },
    sameAs: [site.instagram],
  };
  if (site.whatsapp.validated) ld.telephone = `+${site.whatsapp.value}`;
  if (site.email.validated) ld.email = site.email.value;
  if (site.mapsUrl.validated) (ld.sameAs as string[]).push(site.mapsUrl.value);
  if (site.coordinates.validated && site.coordinates.value) {
    ld.geo = { "@type": "GeoCoordinates", latitude: site.coordinates.value.lat, longitude: site.coordinates.value.lng };
  }
  return { "script:ld+json": ld };
}

export function breadcrumbLd(items: { name: string; path: string }[]): Descriptor {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        item: absoluteUrl(it.path),
      })),
    },
  };
}

/** FAQPage con las preguntas tal cual están publicadas en la página. */
export function faqLd(items: { q: string; a: string }[]): Descriptor {
  return {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    },
  };
}

/** Migas de pan de una página interna: Inicio y la propia página. */
export function crumbs(name: string, path: string): Descriptor {
  return breadcrumbLd([
    { name: "Inicio", path: "/" },
    { name, path },
  ]);
}
