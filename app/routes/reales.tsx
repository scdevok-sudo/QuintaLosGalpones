import { useState } from "react";
import { Button } from "~/components/Button";
import { Cierre } from "~/components/Cierre";
import { Lightbox } from "~/components/Lightbox";
import { Photo } from "~/components/Photo";
import { slots, type SlotName } from "@/content/photos";
import * as c from "@/content/reales";
import { preloadHero } from "@/lib/lcp";
import { crumbs, localBusinessLd, pageMeta } from "@/lib/seo";

const first = c.historias[0].slots[0];
export const links = preloadHero(first);

export function meta() {
  return pageMeta(c.meta, [localBusinessLd(), crumbs("Eventos reales", c.meta.path)]);
}

export default function Reales() {
  const cats = c.categories.filter((k) => k.visible);
  const [filtro, setFiltro] = useState<string>("todos");
  const [abierta, setAbierta] = useState<number | null>(null);
  const shown = cats.filter((k) => filtro === "todos" || k.id === filtro);
  const items: SlotName[] = shown.flatMap((k) => c.historias.filter((h) => h.categoria === k.id).flatMap((h) => h.slots));

  return (
    <>
      <section className="dia pt-10 pb-10 md:pt-16 md:pb-14" aria-labelledby="reales-titulo">
        <div className="wrap grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-14">
          <h1 id="reales-titulo" className="lg:col-span-7">
            {c.hero.h1}
          </h1>
          <p className="lead measure lg:col-span-5">{c.hero.body}</p>
        </div>
        {/* Sin JS cada opción es un ancla a su grupo; con JS filtra. */}
        <nav className="wrap mt-10" aria-label={c.ui.filtro}>
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
            {[{ id: "todos", label: c.ui.todos }, ...cats].map((k) => (
              <li key={k.id}>
                <a
                  className="btn btn-line"
                  href={k.id === "todos" ? "#galeria" : `#${k.id}`}
                  aria-current={filtro === k.id ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setFiltro(k.id);
                  }}
                >
                  {k.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <div id="galeria">
        {shown.map((k, i) => (
          <section key={k.id} id={k.id} className={`cv ${i % 2 === 0 ? "dia" : "noche"} py-16 md:py-24`} aria-labelledby={`${k.id}-t`}>
            <div className="wrap">
              <div className="grid gap-4 lg:grid-cols-12 lg:gap-16">
                <h2 id={`${k.id}-t`} className="text-h3 lg:col-span-5">
                  {k.h2}
                </h2>
                <p className="measure lg:col-span-6 lg:col-start-7">{k.body}</p>
              </div>
              {c.historias
                .filter((h) => h.categoria === k.id)
                .map((h) => (
                  <div key={h.id} className="reales-historia" role="group" aria-label={`Historia ${h.id}`}>
                    {h.datos?.aprobado && (
                      <p className="reales-datos">{[h.datos.invitados, h.datos.epoca, h.datos.sector].filter(Boolean).join(", ")}</p>
                    )}
                    <ul className="reales-grid">
                      {h.slots.map((s, n) => {
                        const lcp = s === first;
                        return (
                          <li key={s} className={n === 0 ? "reales-grande" : undefined}>
                            <button
                              type="button"
                              className="reales-foto"
                              onClick={() => setAbierta(items.indexOf(s))}
                              aria-label={`${c.ui.verFoto}: ${slots[s].alt}`}
                            >
                              <Photo later={!lcp} priority={lcp} slot={s} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>

      <Lightbox items={items} index={abierta} onIndex={setAbierta} />

      <Cierre surface="noche" ariaLabel="Consultar por un evento como este">
        <Button cta={c.cta} />
      </Cierre>
    </>
  );
}
