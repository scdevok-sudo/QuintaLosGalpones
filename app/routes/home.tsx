import { Link } from "react-router";
import { Button } from "~/components/Button";
import { GoogleReviews } from "~/components/GoogleReviews";
import { Photo } from "~/components/Photo";
import { site } from "@/config/site";
import * as home from "@/content/home";
import { track } from "@/lib/analytics";
import { localBusinessLd, pageMeta } from "@/lib/seo";

export function meta() {
  return pageMeta(home.meta, [localBusinessLd()]);
}

const mapQuery = encodeURIComponent(`${site.street}, ${site.locality}, Buenos Aires, Argentina`);

export default function Home() {
  const { hero, lugar, casamientos, empresas, lluvia, testimonios, visita } = home;

  return (
    <>
      {/* HERO: foto a sangre con scrim degradé; el texto vive en la zona oscura. */}
      <section className="relative isolate flex min-h-[min(40rem,calc(100svh-4rem))] items-end overflow-hidden bg-forest-deep text-cream md:min-h-[min(46rem,calc(100svh-4.5rem))]">
        <div className="hero-img absolute inset-0 -z-20">
          <Photo slot="home.hero" fill priority />
        </div>
        <div className="scrim-bottom absolute inset-0 -z-10" aria-hidden="true" />
        <div className="wrap pb-10 pt-40 md:pb-16">
          <div className="hero-rise max-w-3xl">
            <h1 className="h-display text-cream">{hero.h1}</h1>
            <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-cream md:text-lg">{hero.body}</p>
            <div className="mt-7 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
              <Button cta={hero.cta} variant="light" className="w-full sm:w-auto" />
              <Link className="link-light" to={hero.secondary.to} viewTransition>
                {hero.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* UN LUGAR CON ESPACIO: cifras destacadas */}
      <section className="wrap py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="reveal">
            <h2 className="h-section text-forest">{lugar.h2}</h2>
            <p className="measure mt-5 text-ink-soft">{lugar.body}</p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-line pt-7">
              {lugar.stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-1 text-sm leading-snug text-ink-soft">{s.label}</dt>
                  <dd className="m-0 font-display text-5xl leading-none text-forest md:text-6xl">
                    {s.value}
                    <span className="ml-1 text-2xl text-moss md:text-3xl">{s.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-9">
              <Button cta={lugar.cta} variant="ghost" />
            </div>
          </div>
          <div className="reveal">
            <Photo slot="home.espacios" className="rounded-2xl" />
          </div>
        </div>
      </section>

      {/* CASAMIENTOS y EMPRESAS */}
      <section className="bg-sand py-16 md:py-24">
        <div className="wrap grid gap-10 md:grid-cols-2 md:gap-8">
          {[
            { data: casamientos, slot: "home.casamientos" as const },
            { data: empresas, slot: "home.empresas" as const },
          ].map(({ data, slot }) => (
            <article key={data.h2} className="reveal flex flex-col overflow-hidden rounded-3xl bg-cream shadow-[0_1px_0_var(--color-line)]">
              <Photo slot={slot} />
              <div className="flex flex-1 flex-col p-6 md:p-9">
                <h2 className="h-section text-forest">{data.h2}</h2>
                <p className="mt-4 text-ink-soft">{data.body}</p>
                <div className="mt-auto pt-7">
                  <Button cta={data.cta} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ¿Y SI LLUEVE? Banda de foto con scrim */}
      <section className="relative isolate overflow-hidden text-cream">
        <div className="absolute inset-0 -z-20">
          <Photo slot="home.lluvia" fill />
        </div>
        <div className="scrim-flat absolute inset-0 -z-10" aria-hidden="true" />
        <div className="wrap reveal py-20 md:py-32">
          <div className="max-w-2xl">
            <h2 className="h-section text-cream">{lluvia.h2}</h2>
            <p className="mt-5 text-cream">{lluvia.body}</p>
            <div className="mt-8">
              <Button cta={lluvia.cta} variant="light" />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS + reseñas de Google */}
      <section className="bg-forest py-16 text-cream md:py-24">
        <div className="wrap">
          <h2 className="h-section reveal max-w-2xl text-cream">{testimonios.h2}</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
            {testimonios.items.map((t) => (
              <figure key={t.cite} className="reveal m-0 border-l-2 border-amber pl-6">
                <blockquote className="m-0 font-display text-2xl leading-snug md:text-[1.7rem]">
                  <p>“{t.quote}”</p>
                </blockquote>
                <figcaption className="mt-4 text-cream/80">
                  <cite className="not-italic">{t.cite}</cite>
                </figcaption>
              </figure>
            ))}
          </div>
          <GoogleReviews />
        </div>
      </section>

      {/* VISITA: dirección, mapa y CTA */}
      <section className="wrap py-16 md:py-24" id="visita-inicio">
        <div className="grid items-start gap-10 md:grid-cols-2 md:gap-14">
          <div className="reveal">
            <h2 className="h-section text-forest">{visita.h2}</h2>
            <p className="measure mt-5 text-ink-soft">{visita.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button cta={visita.cta} />
              <a
                className="inline-flex min-h-11 items-center font-semibold text-forest underline underline-offset-4"
                href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("click_como_llegar", { origen: "inicio" })}
              >
                Cómo llegar
              </a>
            </div>
          </div>
          <div className="reveal grid gap-4">
            <Photo slot="home.visita" className="rounded-2xl" />
            <div className="overflow-hidden rounded-2xl border border-line">
              <iframe
                title={`Mapa con la ubicación de ${site.name}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block aspect-[4/3] w-full border-0 md:aspect-[16/9]"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
