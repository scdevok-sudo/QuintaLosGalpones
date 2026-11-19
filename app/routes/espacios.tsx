import { Button } from "~/components/Button";
import { Cierre } from "~/components/Cierre";
import { Photo } from "~/components/Photo";
import * as c from "@/content/espacios";
import { preloadHero } from "@/lib/lcp";
import { crumbs, localBusinessLd, pageMeta } from "@/lib/seo";

export const links = preloadHero("espacios.hero");

export function meta() {
  return pageMeta(c.meta, [localBusinessLd(), crumbs("Espacios", c.meta.path)]);
}

export default function Espacios() {
  const { hero, sections } = c;
  const { parque, cubierto, ceremonia, llegada } = sections;

  return (
    <>
      {/* 1. CABECERA: H1 y bajada a un lado, y la foto vertical (split) al otro; en pantallas chicas, H1, foto y bajada */}
      <section className="dia pt-10 pb-16 md:pt-16 md:pb-24" aria-labelledby="espacios-titulo">
        <div className="wrap grid gap-8 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-8">
          <h1 id="espacios-titulo" className="max-w-4xl lg:col-span-7 lg:row-start-1 lg:self-end">
            {hero.h1}
          </h1>
          <div className="hero-frame w-full lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <Photo slot="espacios.hero" priority />
          </div>
          <p className="lead measure lg:col-span-6 lg:row-start-2 lg:self-start">{hero.body}</p>
        </div>
      </section>

      {/* 2. EL PARQUE: la foto chica a la izquierda */}
      <section className="cv dia pb-16 md:pb-28" aria-labelledby="parque-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <Photo later slot="espacios.parque" zoom />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 id="parque-titulo">{parque.h2}</h2>
            <p className="measure mt-6">{parque.body}</p>
          </div>
        </div>
      </section>

      {/* 3. EL ESPACIO CUBIERTO: noche, y es la única foto con la máscara de galpón */}
      <section className="cv noche py-16 md:py-28" aria-labelledby="cubierto-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="cubierto-titulo">{cubierto.h2}</h2>
            <p className="measure mt-6">{cubierto.body}</p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Photo later slot="espacios.cubierto" mask />
          </div>
        </div>
      </section>

      {/* 4. LA CEREMONIA */}
      <section className="cv dia py-16 md:py-28" aria-labelledby="ceremonia-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-5 lg:pt-10">
            <h2 id="ceremonia-titulo" className="text-h3">
              {ceremonia.h2}
            </h2>
            <p className="measure mt-6">{ceremonia.body}</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Photo later slot="espacios.ceremonia" zoom />
          </div>
        </div>
      </section>

      {/* 5. LLEGADA Y SERVICIOS */}
      <section className="cv noche-2 py-16 md:py-24" aria-labelledby="llegada-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <h2 id="llegada-titulo" className="text-h3">
              {llegada.h2}
            </h2>
            <p className="measure mt-6">{llegada.body}</p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Photo later slot="espacios.llegada" />
          </div>
        </div>
      </section>

      {/* 6. CIERRE NOCTURNO: agendar una visita */}
      <Cierre surface="noche" ariaLabel="Agendar una visita">
        <Button cta={llegada.cta} />
      </Cierre>
    </>
  );
}
