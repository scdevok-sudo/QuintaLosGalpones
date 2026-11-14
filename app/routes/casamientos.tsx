import { Button } from "~/components/Button";
import { Cierre } from "~/components/Cierre";
import { Photo } from "~/components/Photo";
import * as c from "@/content/casamientos";
import { preloadHero } from "@/lib/lcp";
import { localBusinessLd, pageMeta } from "@/lib/seo";

export const links = preloadHero("casamientos.hero");

export function meta() {
  return pageMeta(c.meta, [localBusinessLd()]);
}

export default function Casamientos() {
  const { hero, sections } = c;
  const { ceremonia, parque, servicios, lluvia, propuesta } = sections;

  return (
    <>
      {/* 1. CABECERA: H1, bajada y UN botón. La foto es la protagonista y comparte el cuadro con la card de Inicio. */}
      <section className="dia pt-10 pb-16 md:pt-16 md:pb-24" aria-labelledby="casamientos-titulo">
        <div className="wrap grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-14">
          <h1 id="casamientos-titulo" className="lg:col-span-7">
            {hero.h1}
          </h1>
          <div className="lg:col-span-5">
            <p className="lead measure">{hero.body}</p>
            <div className="mt-8">
              <Button cta={hero.cta} />
            </div>
          </div>
        </div>
        <div className="wrap mt-10 md:mt-14">
          <Photo slot="casamientos.hero" priority className="vt-casamientos" />
        </div>
      </section>

      {/* 2. CEREMONIA: texto a la izquierda, foto grande a la derecha */}
      <section className="cv dia pb-16 md:pb-24" aria-labelledby="ceremonia-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="ceremonia-titulo">{ceremonia.h2}</h2>
            <p className="measure mt-6">{ceremonia.body}</p>
          </div>
          <div className="lg:col-span-7">
            <Photo later slot="casamientos.ceremonia" zoom />
          </div>
        </div>
      </section>

      {/* 3. PARQUE Y GALPONES: la foto va primero y más chica; el texto la recorta */}
      <section className="cv dia pb-16 md:pb-24" aria-labelledby="parque-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-5">
            <Photo later slot="casamientos.parque" zoom />
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
            <h2 id="parque-titulo">{parque.h2}</h2>
            <p className="measure mt-6">{parque.body}</p>
          </div>
        </div>
      </section>

      {/* 4. SERVICIOS */}
      <section className="cv dia pb-16 md:pb-28" aria-labelledby="servicios-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6 lg:col-start-1">
            <h2 id="servicios-titulo" className="text-h3">
              {servicios.h2}
            </h2>
            <p className="measure mt-6">{servicios.body}</p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Photo later slot="casamientos.servicios" zoom />
          </div>
        </div>
      </section>

      {/* 5. LLUVIA: noche, con su CTA propio */}
      <section id={lluvia.id} className="cv noche-2 py-16 md:py-24" aria-labelledby="lluvia-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="lluvia-titulo">{lluvia.h2}</h2>
            <p className="measure mt-6">{lluvia.body}</p>
            <div className="mt-8">
              <Button cta={lluvia.cta} />
            </div>
          </div>
          <div className="lg:col-span-7">
            <Photo later slot="casamientos.lluvia" />
          </div>
        </div>
      </section>

      {/* 6. CÓMO PEDIR UNA PROPUESTA: cierre nocturno con la guirnalda */}
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
