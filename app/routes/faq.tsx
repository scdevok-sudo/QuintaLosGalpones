import { Button } from "~/components/Button";
import { Cierre } from "~/components/Cierre";
import * as c from "@/content/faq";
import { crumbs, faqLd, localBusinessLd, pageMeta } from "@/lib/seo";

export function meta() {
  return pageMeta(c.meta, [localBusinessLd(), crumbs("Preguntas frecuentes", c.meta.path), faqLd(c.items)]);
}

export default function Faq() {
  return (
    <>
      {/* 1. El H1 a la izquierda (fijo al scrollear en desktop) y el listado a la derecha */}
      <section className="dia pt-10 pb-20 md:pt-16 md:pb-28" aria-labelledby="faq-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <h1 id="faq-titulo">{c.h1}</h1>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="faq">
              {c.items.map((it) => (
                <details key={it.q}>
                  <summary>{it.q}</summary>
                  <p className="faq-a">{it.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Cierre nocturno: la consulta sigue abierta */}
      <Cierre surface="noche" ariaLabel="Consultar por tu fecha">
        <Button cta={c.cta} />
      </Cierre>
    </>
  );
}
