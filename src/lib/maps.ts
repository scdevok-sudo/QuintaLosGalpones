import { site } from "@/config/site";

/**
 * Destino para Google Maps. Usa las coordenadas solo cuando están validadas; si no, la dirección en texto
 * (las coordenadas actuales son aproximadas y mandarían a la persona a un punto de la calle, no a la puerta).
 */
const place = (() => {
  const c = site.coordinates;
  if (c.validated && c.value) return `${c.value.lat},${c.value.lng}`;
  return `${site.street}, ${site.locality}, Buenos Aires, Argentina`;
})();
const q = encodeURIComponent(place);

/** "Cómo llegar": ruta desde donde esté la persona. No depende de site.mapsUrl. */
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
/** "Ver el mapa" sin JS: abre el lugar en Google Maps. */
export const searchUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;
/** Mapa embebido (se carga recién al pedirlo). */
export const embedUrl = `https://www.google.com/maps?q=${q}&output=embed`;
