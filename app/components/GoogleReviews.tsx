import { site } from "@/config/site";
import { reviews } from "@/content/reviews";

/**
 * Reseñas de Google. Solo se renderiza si hay URL de perfil validada y al menos una reseña real
 * aprobada. No muestra puntaje promedio ni cantidad. Preparado para la Places API a futuro.
 */
export function GoogleReviews() {
  const approved = reviews.filter((r) => r.approved);
  if (!site.mapsUrl.validated || approved.length === 0) return null;

  return (
    <div className="mt-14 border-t border-tarde/25 pt-10">
      <h3>Reseñas en Google</h3>
      <ul className="mt-6 grid list-none gap-6 p-0 md:grid-cols-2">
        {approved.map((r) => (
          <li key={`${r.author}-${r.date}`} className="border-l-4 border-lamparita pl-5">
            <p aria-label={`${r.rating} de 5 estrellas`} className="text-lamparita">
              {"★".repeat(r.rating)}
            </p>
            <blockquote className="m-0 mt-2">
              <p>{r.text}</p>
              <footer className="mt-3">
                <cite className="not-italic">{r.author}</cite>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
      <p className="mt-6">
        <a className="link" href={site.mapsUrl.value} target="_blank" rel="noopener noreferrer">
          Ver todas las reseñas en Google
        </a>
      </p>
    </div>
  );
}
