import { Button } from "~/components/Button";
import { ContactForm } from "~/components/ContactForm";
import { MapFacade } from "~/components/MapFacade";
import { Photo } from "~/components/Photo";
import { site } from "@/config/site";
import * as c from "@/content/contacto";
import { seguimos } from "@/content/home";
import { track } from "@/lib/analytics";
import { preloadHero } from "@/lib/lcp";
import { localBusinessLd, pageMeta } from "@/lib/seo";

export const links = preloadHero("contacto.hero");

export function meta() {
  return pageMeta(c.meta, [localBusinessLd()]);
}

const mapQuery = encodeURIComponent(`${site.street}, ${site.locality}, Buenos Aires, Argentina`);

export default function Contacto() {
  const { hero, visita, form, llegar } = c;

  return (
    <>
      {/* 1. CABECERA: H1, bajada y dos botones que funcionan sin JS (WhatsApp) */}
      <section className="dia pt-10 pb-16 md:pt-16 md:pb-24" aria-labelledby="contacto-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <h1 id="contacto-titulo">{hero.h1}</h1>
            <p className="lead measure mt-6">{hero.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button cta={hero.ctaWhatsapp} />
              <Button cta={hero.ctaVisita} variant="line" />
            </div>
          </div>
          <div className="lg:col-span-6">
            <Photo slot="contacto.hero" priority />
          </div>
        </div>
      </section>

      {/* 2. VISITA */}
      <section id="visita" className="cv noche py-16 md:py-24" aria-labelledby="visita-titulo">
        <div className="wrap grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <h2 id="visita-titulo">{visita.h2}</h2>
            <p className="measure mt-6">{visita.body}</p>
          </div>
          <div className="lg:col-span-5">
            <Button cta={visita.cta} />
          </div>
        </div>
      </section>

      {/* 3. FORMULARIO: a la izquierda qué pasa después, a la derecha los campos */}
      <section id="formulario" className="cv dia py-16 md:py-28" aria-labelledby="formulario-titulo">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="formulario-titulo" className="text-h3">
              {form.title}
            </h2>
            <p className="measure mt-5">{form.help}</p>
            <h3 className="mt-12 text-[1.5rem]">{seguimos.h2}</h3>
            <ol className="m-0 mt-5 grid list-none gap-5 p-0">
              {seguimos.pasos.map((p) => (
                <li key={p.titulo}>
                  <p className="font-display text-[1.125rem] font-bold">{p.titulo}</p>
                  <p className="mt-1">{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* 4. PARA LLEGAR: dirección, mapa con fachada, Cómo llegar y la foto de la entrada */}
      <section className="cv noche-2 py-16 md:py-24" aria-labelledby="llegar-titulo">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="llegar-titulo">{llegar.h2}</h2>
            <p className="measure mt-6">{llegar.body}</p>
            <p className="mt-4">
              <a
                className="link"
                href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("click_como_llegar", { origen: "contacto" })}
              >
                Cómo llegar
              </a>
            </p>
            <div className="mt-8">
              <Photo later slot="contacto.entrada" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <MapFacade />
          </div>
        </div>
      </section>
    </>
  );
}
