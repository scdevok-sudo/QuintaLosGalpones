import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Capa de movimiento de cliente (sin render):
 * 1. Fallback para navegadores sin animation-timeline: marca con data-in los títulos
 *    cuando entran al viewport (una sola vez).
 * 2. Luz cálida que sigue al cursor sobre las superficies "noche" (solo puntero fino, con rAF).
 * Todo se desactiva con prefers-reduced-motion. En táctil queda el brillo fijo del CSS.
 */
export function MotionLayer() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const html = document.documentElement;
    let io: IntersectionObserver | undefined;
    const supportsTimeline = CSS.supports("animation-timeline: view()");
    if (!supportsTimeline && "IntersectionObserver" in window) {
      html.classList.add("mfb");
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              (e.target as HTMLElement).setAttribute("data-in", "");
              io?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.25 },
      );
      document.querySelectorAll("main h2").forEach((el) => io?.observe(el));
    }

    let cleanupGlow = () => {};
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let raf = 0;
      let last: PointerEvent | null = null;
      const apply = () => {
        raf = 0;
        if (!last) return;
        const surface = (last.target as Element | null)?.closest?.("section.noche, section.noche-2, footer.noche");
        if (!surface || surface.classList.contains("no-glow")) return;
        const r = surface.getBoundingClientRect();
        (surface as HTMLElement).style.setProperty("--gx", `${last.clientX - r.left - 340}px`);
        (surface as HTMLElement).style.setProperty("--gy", `${last.clientY - r.top - 340}px`);
      };
      const onMove = (e: PointerEvent) => {
        last = e;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanupGlow = () => {
        window.removeEventListener("pointermove", onMove);
        if (raf) cancelAnimationFrame(raf);
      };
    }

    return () => {
      io?.disconnect();
      cleanupGlow();
    };
  }, [pathname]);

  return null;
}
