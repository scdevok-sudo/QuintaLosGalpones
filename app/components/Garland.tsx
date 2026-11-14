import { type CSSProperties } from "react";

export const BULBS = 10;

/** Guirnalda de lamparitas. La usan el recorrido (se prende con el scroll) y el cierre (se prende al entrar). */
export function Garland({ lit, className = "" }: { lit: number; className?: string }) {
  return (
    <div className={`garland ${className}`} aria-hidden="true">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d="M0 4 Q50 36 100 4" />
      </svg>
      {Array.from({ length: BULBS }, (_, i) => (
        <span key={i} className={`bulb ${i < lit ? "on" : ""}`} style={{ "--t": (i + 0.5) / BULBS } as CSSProperties} />
      ))}
    </div>
  );
}
