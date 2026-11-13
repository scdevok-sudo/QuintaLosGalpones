/**
 * Reseñas de Google. Deben ser reales y copiadas por Santi del perfil, sin reescribir.
 * Mientras no haya URL de perfil validada (site.mapsUrl) el bloque no se renderiza.
 */
export type Review = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date: string;
  approved: boolean;
};

export const reviews: Review[] = [];
