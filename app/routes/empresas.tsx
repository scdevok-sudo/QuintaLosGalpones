import { Button } from "~/components/Button";
import { Cierre } from "~/components/Cierre";
import { Photo } from "~/components/Photo";
import * as c from "@/content/empresas";
import { preloadHero } from "@/lib/lcp";
import { crumbs, localBusinessLd, pageMeta } from "@/lib/seo";

export const links = preloadHero("empresas.hero");

export function meta() {
  return pageMeta(c.meta, [localBusinessLd(), crumbs("Eventos de empresa", c.meta.path)]);
}

export default function Empresas() {
  const { hero, sections } = c;
  const { encuentro, espacios, servicios, lluvia, propuesta } = sections;

  return (
    <>
      {/* 1. CABECERA: foto a la izquierda, el H1 a la derecha y el botón debajo. Distinta de Casamientos. */}
      <section className="dia pt-10 pb-16 md:pt-16 md:pb-24" aria-labelledby="empresas-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <Photo slot="empresas.hero" priority />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-6">
            <h1 id="empresas-titulo">{hero.h1}</h1>
            <p className="lead measure mt-6">{hero.body}</p>
            <div className="mt-8">
              <Button cta={hero.cta} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUÉ TIPO DE ENCUENTRO: texto ancho y la foto angosta desplazada */}
      <section className="cv dia pb-16 md:pb-28" aria-labelledby="encuentro-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 id="encuentro-titulo" className="text-h3">
              {encuentro.h2}
            </h2>
            <p className="measure mt-6">{encuentro.body}</p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:mt-16">
            <Photo later slot="empresas.encuentro" zoom />
          </div>
        </div>
      </section>

      {/* 3. UN LUGAR PARA DISTINTOS MOMENTOS: noche, foto ancha primero y el texto abajo a la derecha */}
      <section className="cv noche py-16 md:py-28" aria-labelledby="espacios-titulo">
        <div className="wrap grid gap-10 lg:gap-14">
          <Photo later slot="empresas.espacios" />
          <div className="grid lg:grid-cols-12">
            <div className="lg:col-span-6 lg:col-start-6">
              <h2 id="espacios-titulo" className="text-h3">
                {espacios.h2}
              </h2>
              <p className="measure mt-6">{espacios.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OPERACIÓN Y SERVICIOS + LLUVIA: dos notas de peso distinto */}
      <section className="cv dia py-16 md:py-28" aria-labelledby="servicios-titulo">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <h2 id="servicios-titulo" className="text-h3">
              {servicios.h2}
            </h2>
            <p className="measure mt-6">{servicios.body}</p>
            <div className="mt-10 max-w-md">
              <Photo later slot="empresas.servicios" zoom />
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-24">
            <h2 id="lluvia-titulo" className="text-h3">
              {lluvia.h2}
            </h2>
            <p className="measure mt-6">{lluvia.body}</p>
          </div>
        </div>
      </section>

      {/* 5. CONTANOS LO ESENCIAL: cierre nocturno con la guirnalda */}
      <Cierre surface="noche" id={propuesta.id} labelledby="propuesta-titulo">
        <h2 id="propuesta-titulo" className="max-w-3xl text-h3">
          {propuesta.h2}
        </h2>
        <p className="measure mx-auto mt-5">{propuesta.body}</p>
        <div className="mt-8">
          <Button cta={propuesta.cta} />
        </div>
      </Cierre>
    </>
  );
}
