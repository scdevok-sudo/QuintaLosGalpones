import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Button } from "~/components/Button";
import { Photo } from "~/components/Photo";
import { heading, scenes } from "@/content/story";

/**
 * "Un día en Los Galpones". Base: 4 bloques apilados (sin JS, reduced-motion, impresión).
 * Con JS y motion: escenario sticky de 100svh. El scroll mueve la escena activa y `--hora` (0 a 1),
 * que gobierna el cielo, el tinte de luz, el reloj y la guirnalda. El texto vive en un panel con
 * superficie propia que cambia de día a noche en el límite entre escenas (nunca se interpola el
 * color del texto sobre un fondo que cambia).
 */
const HORAS = ["15", "16", "17", "18", "19", "20", "21", "22", "23", "00", "01", "02"];
const BULBS = 10;
const BULB_START = 0.5; // las lamparitas empiezan a prenderse a mitad del recorrido
const BULB_STEP = 0.045;

export function Story() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [lit, setLit] = useState(0);
  const sceneRef = useRef(0);
  const litRef = useRef(0);
  const ranRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
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
      stage.style.setProperty("--hh", String(Math.min(HORAS.length - 1, Math.floor(p * HORAS.length))));

      const nextLit = Math.min(BULBS, Math.max(0, Math.floor((p - BULB_START) / BULB_STEP) + 1));
      if (nextLit !== litRef.current) {
        litRef.current = nextLit;
        setLit(nextLit);
      }
      const next = Math.min(scenes.length - 1, Math.floor(p * scenes.length));
      if (next !== sceneRef.current) {
        const old = sceneRef.current;
        sceneRef.current = next;
        ranRef.current = true;
        setPrev(old);
        setScene(next);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setPrev(null), 1000);
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
      clearTimeout(timer.current);
    };
  }, []);

  // Las fotos de las 4 escenas se piden recién cuando la sección está cerca (y sin JS quedan en <noscript>).
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
    <section aria-labelledby="story-titulo" className="noche no-glow">
      <div className="wrap py-14 md:py-20">
        <h2 id="story-titulo" className="max-w-3xl text-h2">
          {heading}
        </h2>
      </div>

      <div className="story" ref={wrapRef}>
        <div className="story-stage" data-theme={theme}>
          {/* Cielo, reloj, guirnalda y riel. Es decorativo salvo el riel, que son botones. */}
          <div className="story-band">
            <div className="story-sky" aria-hidden="true">
              <span className="sky-dia" />
              <span className="sky-atardecer" />
              <span className="sky-noche" />
            </div>
            <div className="story-band-row">
              <div className="story-chip story-clock" aria-hidden="true">
                <span className="clock-hh">
                  <span className="clock-strip">
                    {HORAS.map((h) => (
                      <span key={h}>{h}</span>
                    ))}
                  </span>
                </span>
                <span>:00</span>
              </div>
              <div className="story-garland" aria-hidden="true">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0 4 Q50 36 100 4" />
                </svg>
                {Array.from({ length: BULBS }, (_, i) => (
                  <span
                    key={i}
                    className={`bulb ${i < lit ? "on" : ""}`}
                    style={{ "--t": (i + 0.5) / BULBS } as CSSProperties}
                  />
                ))}
              </div>
            </div>
            <div className="story-rail" role="group" aria-label="Escenas del recorrido">
              <div className="story-chip">
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

          <div className="story-scenes">
            {scenes.map((s, i) => (
              <article
                key={s.id}
                className="story-scene"
                data-state={i === scene ? "active" : i === prev ? "prev" : "off"}
                data-run={ranRef.current ? "1" : undefined}
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
                  <div className="max-w-md">
                    <h3>{s.nombre}</h3>
                    <p className="mt-3">{s.texto}</p>
                    <p className="mt-4">
                      <Button cta={s.cta} variant="link" />
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
