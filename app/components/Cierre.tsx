import { useEffect, useRef, useState } from "react";
import { BULBS, Garland } from "~/components/Garland";
import { ExpressButton } from "~/components/Express";

/**
 * Cierre nocturno (momento 2): la guirnalda del recorrido se prende UNA sola vez al entrar en pantalla y el
 * botón queda debajo. En el HTML y sin JS las lamparitas ya vienen prendidas; con reduced-motion también.
 */
export function Cierre({ label, surface }: { label: string; surface: string }) {
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
    <section className={`cv ${surface} py-20 text-center md:py-28`} aria-label="Consultar por mi fecha">
      <div className="wrap">
        <div ref={ref} className="cierre-guirnalda">
          <Garland lit={lit} />
        </div>
        <div className="mt-10">
          <ExpressButton label={label} origen="cierre" />
        </div>
      </div>
    </section>
  );
}
