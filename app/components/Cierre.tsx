import { useEffect, useRef, useState } from "react";
import { BULBS, Garland } from "~/components/Garland";

/**
 * Cierre nocturno (momento 2): la guirnalda del recorrido se prende UNA sola vez al entrar en pantalla y el
 * contenido (títulos, texto y el CTA) queda debajo. En el HTML y sin JS las lamparitas ya vienen prendidas;
 * con reduced-motion también.
 */
export function Cierre({
  surface,
  id,
  labelledby,
  ariaLabel,
  children,
}: {
  surface: string;
  id?: string;
  labelledby?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(BULBS);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setLit(0);
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let i = 0;
        timer = setInterval(() => {
          i += 1;
          setLit(i);
          if (i >= BULBS) clearInterval(timer);
        }, 90);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, []);

  return (
    <section id={id} className={`cv ${surface} py-20 text-center md:py-28`} aria-labelledby={labelledby} aria-label={ariaLabel}>
      <div className="wrap">
        <div ref={ref} className="cierre-guirnalda">
          <Garland lit={lit} />
        </div>
        <div className="mt-10 flex flex-col items-center">{children}</div>
      </div>
    </section>
  );
}
