import { site } from "@/config/site";
import { reviews } from "@/content/reviews";

/**
 * Reseñas de Google. Solo se renderiza si hay URL de perfil validada y al menos una reseña real
 * aprobada. No muestra puntaje promedio ni cantidad: solo las reseñas copiadas del perfil.
 * Queda preparado para alimentarse de la Places API más adelante.
 */
export function GoogleReviews() {
  const approved = reviews.filter((r) => r.approved);
  if (!site.mapsUrl.validated || approved.length === 0) return null;

  return (
    <div className="mt-14 border-t border-cream/20 pt-10">
      <h3 className="font-display text-2xl">Reseñas en Google</h3>
      <ul className="mt-6 grid list-none gap-6 p-0 md:grid-cols-2">
        {approved.map((r) => (
          <li key={`${r.author}-${r.date}`} className="rounded-2xl bg-cream/10 p-6">
            <p aria-label={`${r.rating} de 5 estrellas`} className="text-amber">
              {"★".repeat(r.rating)}
            </p>
            <blockquote className="mt-2 m-0">
              <p>{r.text}</p>
              <footer className="mt-3 text-sm text-cream/75">
                <cite className="not-italic">{r.author}</cite>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
      <p className="mt-6">
        <a className="link-light" href={site.mapsUrl.value} target="_blank" rel="noopener noreferrer">
          Ver todas las reseñas en Google
        </a>
      </p>
    </div>
  );
}
