import { Link } from "react-router";
import { site } from "@/config/site";
import * as c from "@/content/privacidad";
import { crumbs, pageMeta } from "@/lib/seo";

export function meta() {
  return pageMeta(c.meta, [crumbs("Política de privacidad", c.meta.path)]);
}

export default function Privacidad() {
  return (
    <section className="dia pt-10 pb-20 md:pt-16 md:pb-28" aria-labelledby="privacidad-titulo">
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <h1 id="privacidad-titulo">{c.h1}</h1>
            {!site.privacyReviewed.validated && (
              <p className="mt-6 border-l-4 border-madera pl-4" role="note">
                {c.borrador}
              </p>
            )}
            <nav aria-label="En esta página" className="mt-8 hidden lg:block">
              <ul className="m-0 grid list-none gap-1 p-0">
                {c.sections.map((s) => (
                  <li key={s.id}>
                    <a className="link" href={`#${s.id}`}>
                      {s.h2}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="lead measure">{c.intro}</p>
          {c.sections.map((s) => (
            <section key={s.id} id={s.id} className="mt-12" aria-labelledby={`${s.id}-t`}>
              <h2 id={`${s.id}-t`} className="text-h3">
                {s.h2}
              </h2>
              {s.body.map((p) => (
                <p key={p} className="measure mt-4">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="mt-12">{c.actualizado}</p>
          <p className="mt-6">
            <Link className="link" to="/contacto#formulario" viewTransition>
              Ir al formulario de contacto
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
