import { Link } from "react-router";
import { footer } from "@/content/common";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-forest-deep pb-28 text-cream md:pb-12">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl">{footer.name}</p>
          <p className="mt-2 max-w-xs text-cream/80">{footer.line}</p>
        </div>
        <div className="text-cream/90">
          <p className="eyebrow !text-cream/60">Dónde estamos</p>
          <address className="mt-3 not-italic">
            {footer.address}
            <br />
            {site.locality}, {site.region}
          </address>
          {site.whatsapp.validated && <p className="mt-2">WhatsApp {site.whatsapp.display}</p>}
          {site.email.validated && (
            <p className="mt-2">
              <a className="underline underline-offset-4" href={`mailto:${site.email.value}`}>
                {site.email.value}
              </a>
            </p>
          )}
          {site.mapsUrl.validated && (
            <p className="mt-2">
              <a className="underline underline-offset-4" href={site.mapsUrl.value} target="_blank" rel="noopener noreferrer">
                Ver en Google Maps
              </a>
            </p>
          )}
        </div>
        <ul className="m-0 list-none space-y-1 p-0">
          <li>
            <a
              className="inline-flex min-h-11 items-center underline underline-offset-4"
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {footer.instagramLabel}
            </a>
          </li>
          <li>
            <Link className="inline-flex min-h-11 items-center underline underline-offset-4" to="/contacto/" viewTransition>
              {footer.contactLabel}
            </Link>
          </li>
          <li>
            <Link
              className="inline-flex min-h-11 items-center underline underline-offset-4"
              to="/politica-de-privacidad/"
              viewTransition
            >
              {footer.privacyLabel}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
