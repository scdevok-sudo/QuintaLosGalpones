import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Photo } from "~/components/Photo";
import { heading, scenes } from "@/content/story";

/**
 * "Un día en Los Galpones". Base: 4 bloques apilados (sin JS, reduced-motion, impresión).
 * Con JS y motion: escenario sticky de 100svh con 4 escenas. El scroll mueve la escena activa
 * y `--hora` (0 a 1), que gobierna el tinte de luz. El texto vive en un panel con superficie
 * propia que cambia de día a noche en el límite entre escenas.
 */
export function Story() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(0);
  const sceneRef = useRef(0);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const stageOn = window.matchMedia("(scripting: enabled) and (prefers-reduced-motion: no-preference)");
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!stageOn.matches) return;
      const rect = wrap.getBoundingClientRect();
      const stage = wrap.firstElementChild as HTMLElement;
      const range = rect.height - stage.offsetHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, range)));
      wrap.style.setProperty("--hora", p.toFixed(3));
      const next = Math.min(scenes.length - 1, Math.floor(p * scenes.length));
      if (next !== sceneRef.current) {
        sceneRef.current = next;
        setScene(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Las fotos de las 4 escenas se piden recién cuando la sección está cerca.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "700px 0px" },
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  function goTo(i: number) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const stage = wrap.firstElementChild as HTMLElement;
    const range = wrap.offsetHeight - stage.offsetHeight;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((i + 0.5) / scenes.length) * range });
  }

  const theme = scenes[scene].tema;

  return (
    <section aria-labelledby="story-titulo" className="noche">
      <div className="wrap py-14 md:py-20">
        <h2 id="story-titulo" className="max-w-3xl text-h2">
          {heading}
        </h2>
      </div>

      <div className="story" ref={wrapRef}>
        <div className="story-stage">
          {scenes.map((s, i) => (
            <article
              key={s.id}
              className="story-scene"
              data-active={i === scene}
              aria-label={s.nombre}
            >
              <div className="story-photo">
                <Photo slot={s.slot} defer={!near} />
                {/* Luz: viven dentro de la foto, así nunca tiñen el panel de texto. */}
                <div className="story-tint-gold" aria-hidden="true" />
                <div className="story-tint-night" aria-hidden="true" />
                <div className="story-glow" aria-hidden="true" />
              </div>
              <div className={`story-panel ${s.tema === "dia" ? "is-dia" : "is-noche"}`}>
                <div className="story-panel-inner max-w-md">
                  <h3>{s.nombre}</h3>
                  <p className="mt-3">{s.texto}</p>
                  <p className="mt-4">
                    <Link className="link" to={s.cta.to ?? "/"} viewTransition>
                      {s.cta.label}
                    </Link>
                  </p>
                </div>
              </div>
            </article>
          ))}

          <div className="story-rail" role="group" aria-label="Escenas del recorrido">
            <div className="story-rail-inner" data-theme={theme}>
              {scenes.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className="story-rail-btn"
                  aria-current={i === scene ? "true" : undefined}
                  onClick={() => goTo(i)}
                >
                  {s.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
