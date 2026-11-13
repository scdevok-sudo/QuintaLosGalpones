import { useState } from "react";
import { site } from "@/config/site";

const query = encodeURIComponent(`${site.street}, ${site.locality}, Buenos Aires, Argentina`);

/** Mapa con fachada de clic: no carga el iframe de Google hasta que la persona lo pide. */
export function MapFacade() {
  const [on, setOn] = useState(false);
  return (
    <div className="aspect-[4/3] overflow-clip rounded-lg border-2 border-tarde/40 md:aspect-[16/10]">
      {on ? (
        <iframe
          title={`Mapa con la ubicación de ${site.name}`}
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-full w-full border-0"
        />
      ) : (
        <div className="noche-2 relative flex h-full flex-col items-start justify-end gap-3 p-5">
          <svg className="pin" viewBox="0 0 36 46" aria-hidden="true" fill="currentColor">
            <path d="M18 0C8.6 0 1 7.4 1 16.6 1 29.6 18 46 18 46s17-16.4 17-29.4C35 7.4 27.4 0 18 0Zm0 23a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />
          </svg>
          <p className="font-display text-h3">{site.street}</p>
          <p>
            {site.locality}, {site.region}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setOn(true)}>
            Ver el mapa
          </button>
        </div>
      )}
    </div>
  );
}
