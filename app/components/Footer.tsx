import { Link } from "react-router";
import { Logo } from "~/components/Logo";
import { footer } from "@/content/common";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="noche border-t border-tarde/15">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo tone="blanco" height={44} lazy />
          <p className="mt-2 max-w-xs">{footer.line}</p>
        </div>
        <div>
          <p className="font-display font-semibold">Dónde estamos</p>
          <address className="mt-2 not-italic">
            {footer.address}
            <br />
            {site.locality}, {site.region}
          </address>
          {site.whatsapp.validated && <p className="mt-2">WhatsApp {site.whatsapp.display}</p>}
          {site.email.validated && (
            <p className="mt-2">
              <a className="link" href={`mailto:${site.email.value}`}>
                {site.email.value}
              </a>
            </p>
          )}
          {site.mapsUrl.validated && (
            <p className="mt-2">
              <a className="link" href={site.mapsUrl.value} target="_blank" rel="noopener noreferrer">
                Ver en Google Maps
              </a>
            </p>
          )}
        </div>
        <ul className="m-0 list-none p-0">
          <li>
            <a className="link" href={site.instagram} target="_blank" rel="noopener noreferrer">
              {footer.instagramLabel}
            </a>
          </li>
          <li>
            <Link className="link" to="/contacto" viewTransition>
              {footer.contactLabel}
            </Link>
          </li>
          <li>
            <Link className="link" to="/politica-de-privacidad" viewTransition>
              {footer.privacyLabel}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
