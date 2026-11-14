import { site } from "@/config/site";

const query = encodeURIComponent(`${site.street}, ${site.locality}, Buenos Aires, Argentina`);

/** Mapa de Google embebido. `loading="lazy"` lo pide recién cerca del viewport, así no pesa en la carga. */
export function MapEmbed() {
  return (
    <div className="aspect-[4/3] overflow-clip rounded-lg border-2 border-tarde/40 md:aspect-[21/9]">
      <iframe
        title={`Mapa con la ubicación de ${site.name}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-full w-full border-0"
      />
    </div>
  );
}
