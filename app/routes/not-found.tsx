import { Link } from "react-router";
import { nav, notFoundMeta } from "@/content/common";
import { pageMeta } from "@/lib/seo";

export function meta() {
  return [...pageMeta(notFoundMeta), { name: "robots", content: "noindex" }];
}

export default function NotFound() {
  return (
    <section className="wrap py-20 md:py-28">
      <p className="eyebrow">Error 404</p>
      <h1 className="h-display mt-3 text-forest">No encontramos esta página</h1>
      <p className="measure mt-5 text-ink-soft">
        Puede que el enlace haya cambiado. Mientras tanto, podés ir a cualquiera de las secciones principales.
      </p>
      <ul className="mt-8 grid list-none gap-2 p-0 sm:grid-cols-2">
        {nav.map((i) => (
          <li key={i.to}>
            <Link className="flex min-h-12 items-center rounded-xl border border-line bg-sand/50 px-4 hover:bg-sand" to={i.to}>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
