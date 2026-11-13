import { Link } from "react-router";
import { nav, notFoundMeta } from "@/content/common";
import { pageMeta } from "@/lib/seo";

export function meta() {
  return [...pageMeta(notFoundMeta), { name: "robots", content: "noindex" }];
}

export default function NotFound() {
  return (
    <section className="wrap py-20 md:py-28">
      <h1>No encontramos esta página</h1>
      <p className="lead measure mt-6">
        Puede que el enlace haya cambiado. Mientras tanto, podés ir a cualquiera de las secciones principales.
      </p>
      <ul className="mt-8 flex list-none flex-wrap gap-x-6 gap-y-1 p-0">
        {nav.map((i) => (
          <li key={i.to}>
            <Link className="link" to={i.to}>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
