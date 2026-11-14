import type { CSSProperties } from "react";
import { Button } from "~/components/Button";
import { ExpressButton } from "~/components/Express";
import { GoogleReviews } from "~/components/GoogleReviews";
import { Cierre } from "~/components/Cierre";
import { MapFacade } from "~/components/MapFacade";
import { Photo } from "~/components/Photo";
import { RainToggle } from "~/components/RainToggle";
import { Story } from "~/components/Story";
import { site } from "@/config/site";
import * as home from "@/content/home";
import { track } from "@/lib/analytics";
import { localBusinessLd, pageMeta } from "@/lib/seo";

export function meta() {
  return pageMeta(home.meta, [localBusinessLd()]);
}

const mapQuery = encodeURIComponent(`${site.street}, ${site.locality}, Buenos Aires, Argentina`);

export default function Home() {
  const { hero, lugar, casamientos, empresas, lluvia, testimonios, seguimos, visita } = home;
  // Solo se muestran testimonios con autorización. Con menos de 3 aprobados la sección no existe.
  const aprobados = testimonios.items.filter((t) => t.approved);
  const showTestimonios = aprobados.length >= 3;
  // Las superficies de noche alternan después de los caminos, también si una sección falta.
  let n = 0;
  const noche = () => (n++ % 2 === 0 ? "noche-2" : "noche");

  return (
    <>
      {/* 1. HERO: sin velo. El texto va fuera de la foto, así el contraste está garantizado. */}
      <section className="hero dia" aria-labelledby="hero-titulo">
        <div className="order-2 px-5 pt-8 pb-12 md:px-10 lg:order-1 lg:px-0 lg:py-16">
          <h1 id="hero-titulo" className="hero-title">
            {hero.h1Lines.map((line, i) => (
              <span className="line" key={line}>
                <span className="line-in" style={{ "--i": i } as CSSProperties}>
                  {line}
                </span>{" "}
              </span>
            ))}
          </h1>
          <p className="lead measure mt-6">{hero.body}</p>
          <div className="mt-8 flex flex-col items-start gap-x-6 gap-y-1 sm:flex-row sm:flex-wrap sm:items-center">
            <ExpressButton label={hero.cta.label} origen="hero" className="btn btn-primary w-full sm:w-auto sm:whitespace-nowrap" />
            <ExpressButton label={hero.secondary.label} origen="hero-2" className="link" />
          </div>
          <p className="mt-8 max-w-md">{hero.datos}</p>
        </div>
        <div className="hero-photos order-1 lg:order-2">
          <Photo slot="hero.principal" mask priority />
          <Photo slot="hero.secundaria" className="hero-photo-2" />
        </div>
      </section>

      {/* 2. FICHA DEL LUGAR: datos de decisión rápida */}
      <section className="cv dia pt-4 pb-16 md:pt-8 md:pb-24" aria-labelledby="lugar-titulo">
        {/* Visita: bloque completo en la segunda pantalla. La consulta abre el panel; la visita va por WhatsApp. */}
        <div className="wrap mb-14 md:mb-20" id="visita">
          <div className="visita-rapida">
            <div>
              <h2 id="visita-titulo" className="text-h3">
                {visita.h2}
              </h2>
              <p className="measure mt-3">{visita.body}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button cta={visita.ctaVisita} />
              <ExpressButton label={visita.cta.label} origen="visita" className="btn btn-line" />
            </div>
          </div>
        </div>
        <div className="wrap grid gap-10 lg:grid-cols-[5fr_6fr] lg:gap-20">
          <div>
            <h2 id="lugar-titulo">{lugar.h2}</h2>
            <p className="measure mt-6">{lugar.body}</p>
            <div className="mt-8">
              <Button cta={lugar.cta} variant="line" />
            </div>
          </div>
          <dl className="m-0 grid gap-x-8 gap-y-5 sm:grid-cols-[9.5rem_1fr]">
            {lugar.ficha.map((f) => (
              <div key={f.term} className="contents">
                <dt className="font-display text-[1.125rem] font-bold">{f.term}</dt>
                <dd className="m-0 -mt-3 mb-2 sm:mt-0 sm:mb-0">{f.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3. UN DÍA EN LOS GALPONES: momento firma */}
      <Story />

      {/* 4. DOS CAMINOS: dos cards parejas. Hover de 2 px y zoom 1,02 en la foto; los CTA siempre visibles. */}
      <section className="cv noche pb-16 md:pb-28" aria-label="Tipos de evento">
        <div className="wrap">
          <div className="caminos">
            <article className="camino">
              <Photo slot="home.casamientos" zoom className="vt-casamientos" />
              <div className="noche-2 flex flex-1 flex-col p-6 md:p-8">
                <h2 className="text-h3">{casamientos.h2}</h2>
                <p className="measure mt-4">{casamientos.body}</p>
                <div className="mt-auto pt-7">
                  <Button cta={casamientos.cta} />
                </div>
              </div>
            </article>

            <article className="camino">
              <Photo slot="home.empresas" zoom />
              <div className="noche-2 flex flex-1 flex-col p-6 md:p-8">
                <h2 className="text-h3">{empresas.h2}</h2>
                <p className="measure mt-4">{empresas.body}</p>
                <div className="mt-auto pt-7">
                  <Button cta={empresas.cta} />
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 5. ¿Y SI LLUEVE? con interruptor Sol / Lluvia */}
      <section className={`cv ${noche()} py-16 md:py-24`} aria-labelledby="lluvia-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="lluvia-titulo">{lluvia.h2}</h2>
            <p className="measure mt-6">{lluvia.body}</p>
            <div className="mt-8">
              <Button cta={lluvia.cta} />
            </div>
          </div>
          <div className="lg:col-span-7">
            <RainToggle />
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIOS: solo aprobados y solo si hay 3 o más */}
      {showTestimonios && (
        <section className={`cv ${noche()} py-16 md:py-28`} aria-labelledby="testimonios-titulo">
          <div className="wrap">
            <h2 id="testimonios-titulo" className="max-w-2xl text-h3">
              {testimonios.h2}
            </h2>
            <ul className="testimonios mt-10" style={{ "--n": 3 } as CSSProperties}>
              {aprobados.slice(0, 3).map((t) => (
                <li key={t.cite}>
                  <figure className="m-0">
                    <blockquote className="m-0">
                      <p className="font-body text-[clamp(1.35rem,1.05rem+1.1vw,1.75rem)] leading-[1.25]">“{t.quote}”</p>
                    </blockquote>
                    <figcaption className="mt-4">
                      <cite className="font-display font-semibold not-italic">{t.cite}</cite>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <GoogleReviews />
          </div>
        </section>
      )}

      {/* 7. CÓMO SEGUIMOS: secuencia real de 3 pasos */}
      <section className={`cv ${noche()} py-16 md:py-24`} aria-labelledby="seguimos-titulo">
        <div className="wrap">
          <h2 id="seguimos-titulo" className="text-h3">
            {seguimos.h2}
          </h2>
          <ol className="m-0 mt-10 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-12">
            {seguimos.pasos.map((p, i) => (
              <li key={p.titulo} className="grid grid-cols-[2.5rem_1fr] gap-x-3 md:block">
                <span aria-hidden="true" className="font-display text-h3 font-extrabold text-lamparita md:block">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[1.5rem]">{p.titulo}</h3>
                  <p className="mt-2">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 8. CÓMO LLEGAR: fachada del mapa (carga el iframe al clic) y enlace aparte a Maps */}
      <section className={`cv ${noche()} py-16 md:py-24`} aria-label="Cómo llegar">
        <div className="wrap">
          <MapFacade />
          <p className="mt-4">
            <a
              className="link"
              href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("click_como_llegar", { origen: "inicio" })}
            >
              Cómo llegar
            </a>
          </p>
        </div>
      </section>

      {/* 9. CIERRE NOCTURNO: guirnalda que se prende una vez y el CTA debajo */}
      <Cierre label={visita.cta.label} surface={noche()} />
    </>
  );
}
