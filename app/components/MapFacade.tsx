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
          <p className="font-display text-h3">
            {site.street}, {site.locality}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setOn(true)}>
            Ver el mapa
          </button>
        </div>
      )}
    </div>
  );
}
