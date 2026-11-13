import { Link } from "react-router";
import { Button } from "~/components/Button";
import { ExpressButton } from "~/components/Express";
import { GoogleReviews } from "~/components/GoogleReviews";
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

  return (
    <>
      {/* 1. HERO: sin velo. El texto va fuera de la foto, así el contraste está garantizado. */}
      <section className="hero dia" aria-labelledby="hero-titulo">
        <div className="order-2 px-5 pt-8 pb-12 md:px-10 lg:order-1 lg:px-0 lg:py-16">
          <h1 id="hero-titulo" className="max-w-[12ch] lg:max-w-none">
            {hero.h1}
          </h1>
          <p className="lead measure mt-6">{hero.body}</p>
          <div className="mt-8 flex flex-col items-start gap-x-6 gap-y-1 sm:flex-row sm:flex-wrap sm:items-center">
            <ExpressButton label={hero.cta.label} origen="hero" className="btn btn-primary w-full sm:w-auto sm:whitespace-nowrap" />
            <Link className="link" to={hero.secondary.to} viewTransition>
              {hero.secondary.label}
            </Link>
          </div>
          <p className="mt-8 max-w-md">{hero.datos}</p>
        </div>
        <div className="hero-photos order-1 lg:order-2">
          <Photo slot="hero.principal" mask priority />
          <Photo slot="hero.secundaria" className="hero-photo-2" />
        </div>
      </section>

      {/* 2. FICHA DEL LUGAR: datos de decisión rápida */}
      <section className="cv dia pt-4 pb-16 md:py-24" aria-labelledby="lugar-titulo">
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

      {/* 4. DOS CAMINOS: uno grande y uno más chico, de otra proporción */}
      <section className="cv noche pb-16 md:pb-28" aria-label="Tipos de evento">
        <div className="wrap">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-7">
              <Photo slot="home.casamientos" mask />
            </div>
            <div className="lg:col-span-5 lg:pb-6">
              <h2>{casamientos.h2}</h2>
              <p className="measure mt-5">{casamientos.body}</p>
              <div className="mt-7">
                <Button cta={casamientos.cta} />
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-6 lg:mt-24 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="order-2 lg:order-1 lg:col-span-5 lg:col-start-2">
              <h2 className="text-h3">{empresas.h2}</h2>
              <p className="mt-4">{empresas.body}</p>
              <div className="mt-6">
                <Button cta={empresas.cta} variant="line" />
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5 lg:col-start-8">
              <Photo slot="home.empresas" className="rounded-[4px]" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. ¿Y SI LLUEVE? con interruptor Sol / Lluvia */}
      <section className="cv noche-2 py-16 md:py-24" aria-labelledby="lluvia-titulo">
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

      {/* 6. TESTIMONIOS + reseñas de Google */}
      <section className="cv noche py-16 md:py-28" aria-labelledby="testimonios-titulo">
        <div className="wrap">
          <h2 id="testimonios-titulo" className="max-w-2xl text-h3">
            {testimonios.h2}
          </h2>
          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-8">
            {testimonios.items.map((t, i) => (
              <figure
                key={t.cite}
                className={`m-0 ${i === 0 ? "lg:col-span-7" : "lg:col-span-4 lg:col-start-9 lg:mt-24"}`}
              >
                <blockquote className="m-0">
                  <p
                    className={`font-body ${
                      i === 0 ? "text-[clamp(1.7rem,1.1rem+2.6vw,3.1rem)] leading-[1.15]" : "text-[1.45rem] leading-snug"
                    }`}
                  >
                    “{t.quote}”
                  </p>
                </blockquote>
                <figcaption className="mt-4">
                  <cite className="font-display font-semibold not-italic">{t.cite}</cite>
                </figcaption>
              </figure>
            ))}
          </div>
          <GoogleReviews />
        </div>
      </section>

      {/* 7. CÓMO SEGUIMOS: secuencia real de 3 pasos */}
      <section className="cv noche-2 py-16 md:py-24" aria-labelledby="seguimos-titulo">
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

      {/* 8. CONSULTA EXPRESS + CÓMO LLEGAR + MAPA */}
      <section className="cv noche py-16 md:py-28" aria-labelledby="visita-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <h2 id="visita-titulo">{visita.h2}</h2>
            <p className="measure mt-6">{visita.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <ExpressButton label={visita.cta.label} origen="cierre" />
              <Button cta={visita.ctaVisita} variant="line" />
            </div>
            <p className="mt-6">
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
          <div className="lg:col-span-6">
            <MapFacade />
          </div>
        </div>
      </section>
    </>
  );
}
