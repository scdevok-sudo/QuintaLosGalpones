import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { mapLabels, type MapLabel } from "@/content/mapa.generated";
import { embedUrl, searchUrl } from "@/lib/maps";

const Labels = ({ list, className }: { list: MapLabel[]; className: string }) => (
  <div className={className} aria-hidden="true">
    {list.map((l) => (
      <span
        key={l.text}
        className={`map-label${l.strong ? " map-label-strong" : ""}`}
        style={{ left: `${l.x}%`, top: `${l.y}%` }}
      >
        {l.text}
      </span>
    ))}
  </div>
);

/**
 * Mapa estático on-brand (generado con `npm run map:build` desde OpenStreetMap, sin pedidos a terceros en la carga).
 * "Ver el mapa" es un enlace a Google Maps (funciona sin JS); con JS carga el iframe de Google en el mismo lugar.
 */
export function MapFacade() {
  const [on, setOn] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // Foco gestionado: al abrir el mapa el foco pasa al iframe (si no, queda en un botón que ya no existe).
  useEffect(() => {
    if (on) frame.current?.focus();
  }, [on]);

  return (
    <div className="map relative aspect-[4/3] overflow-clip rounded-lg border-2 border-tarde/40 md:aspect-[16/10]">
      {on ? (
        <iframe
          ref={frame}
          title={`Mapa con la ubicación de ${site.name}`}
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-full w-full border-0"
        />
      ) : (
        <div className="noche-2 absolute inset-0">
          <picture>
            <source media="(min-width: 768px)" srcSet="/map/quinta-16x10.svg" width="1280" height="800" />
            <img
              src="/map/quinta-4x3.svg"
              width="1200"
              height="900"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
          <span className="map-pulse" aria-hidden="true" />
          <Labels list={mapLabels["4x3"]} className="md:hidden" />
          <Labels list={mapLabels["16x10"]} className="hidden md:block" />
          <a
            className="map-attr"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            © colaboradores de OpenStreetMap
          </a>
          <div className="map-card">
            <p className="font-display text-lg leading-tight md:text-xl">
              {site.street}, {site.locality}
            </p>
            <a
              className="btn btn-primary shrink-0"
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                setOn(true);
              }}
            >
              Ver el mapa
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
