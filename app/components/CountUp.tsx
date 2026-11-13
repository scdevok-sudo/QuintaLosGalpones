import { useEffect, useRef } from "react";

/**
 * Número que cuenta de 0 al valor al entrar al viewport (900 ms). El valor final está siempre en el
 * HTML: sin JS, con reduced-motion o antes de la hidratación se ve el número completo.
 * Solo para datos validados que vienen del copy.
 */
export function CountUp({ text, to }: { text: string; to: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        // Reservar el ancho final evita que el texto de al lado se corra mientras cuenta.
        el.style.minWidth = `${el.offsetWidth}px`;
        const t0 = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / 900);
          const eased = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
          el.textContent = k === 1 ? text : Math.round(to * eased).toLocaleString("es-AR");
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text, to]);

  return (
    <span ref={ref} className="inline-block text-right tabular-nums" suppressHydrationWarning>
      {text}
    </span>
  );
}
