import { useEffect, useRef, useState } from "react";

type Item = { quote: string; cite: string };

/**
 * Carrusel de testimonios con scroll-snap nativo, arrastrable con el mouse y con puntos indicadores.
 * Sin marquee ni autoavance. Sin JS sigue siendo una fila desplazable.
 */
export function Testimonios({ items }: { items: Item[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const drag = useRef({ on: false, x: 0, left: 0, moved: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const kids = Array.from(el.children) as HTMLElement[];
        let best = 0;
        let bestDist = Infinity;
        kids.forEach((k, i) => {
          const d = Math.abs(k.offsetLeft - el.scrollLeft);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        setCurrent(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function goTo(i: number) {
    const el = track.current;
    const kid = el?.children[i] as HTMLElement | undefined;
    if (!el || !kid) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: kid.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div>
      <ul
        ref={track}
        className="car-track"
        tabIndex={0}
        aria-label="Testimonios, deslizá para ver el siguiente"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goTo(Math.min(items.length - 1, current + 1));
          if (e.key === "ArrowLeft") goTo(Math.max(0, current - 1));
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { on: true, x: e.clientX, left: track.current.scrollLeft, moved: false };
          track.current.setPointerCapture(e.pointerId);
          track.current.classList.add("is-drag");
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.on || !track.current) return;
          d.moved = true;
          track.current.scrollLeft = d.left - (e.clientX - d.x);
        }}
        onPointerUp={() => {
          drag.current.on = false;
          track.current?.classList.remove("is-drag");
          goTo(current);
        }}
      >
        {items.map((t, i) => (
          <li key={t.cite} className="car-item">
            <figure className="m-0">
              <blockquote className="m-0">
                <p
                  className={`font-body ${
                    i === 0
                      ? "text-[clamp(1.55rem,1.05rem+2.2vw,2.7rem)] leading-[1.18]"
                      : "text-[clamp(1.4rem,1rem+1.8vw,2.3rem)] leading-[1.22]"
                  }`}
                >
                  “{t.quote}”
                </p>
              </blockquote>
              <figcaption className="mt-4">
                <cite className="font-display font-semibold not-italic">{t.cite}</cite>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="car-dots" role="group" aria-label="Elegir testimonio">
        {items.map((t, i) => (
          <button
            key={t.cite}
            type="button"
            className="car-dot"
            aria-label={`Ir al testimonio de ${t.cite}`}
            aria-current={i === current ? "true" : undefined}
            onClick={() => goTo(i)}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}
