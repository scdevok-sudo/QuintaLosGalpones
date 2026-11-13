import { useState } from "react";
import { Photo } from "~/components/Photo";
import { env } from "@/config/site";
import { slots } from "@/content/photos";
import { lluvia } from "@/content/home";

/**
 * Interruptor Sol / Lluvia. Solo se muestra si hay foto real del armado cubierto.
 * En preview se puede forzar con VITE_PREVIEW_PENDING=true para ver cómo queda con la provisoria.
 */
export function RainToggle() {
  const [mode, setMode] = useState<"sol" | "lluvia">("sol");
  const ready = !slots["lluvia.cubierto"].pending || env.previewPending;
  if (!ready) return null;
  const { toggle } = lluvia;

  return (
    <div>
      <div className="rain-stack" aria-live="polite">
        <figure className="rain-layer m-0" data-hidden={mode !== "sol"} aria-hidden={mode !== "sol"}>
          <Photo slot="lluvia.sol" mask />
          <figcaption className="mt-3 text-small">{toggle.sol.caption}</figcaption>
        </figure>
        <figure className="rain-layer m-0" data-hidden={mode !== "lluvia"} aria-hidden={mode !== "lluvia"}>
          <Photo slot="lluvia.cubierto" mask />
          <figcaption className="mt-3 text-small">{toggle.lluvia.caption}</figcaption>
        </figure>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="font-display font-semibold" id="rain-label">
          {toggle.label}
        </span>
        <div className="seg" role="group" aria-labelledby="rain-label">
          <button type="button" aria-pressed={mode === "sol"} onClick={() => setMode("sol")}>
            {toggle.sol.name}
          </button>
          <button type="button" aria-pressed={mode === "lluvia"} onClick={() => setMode("lluvia")}>
            {toggle.lluvia.name}
          </button>
        </div>
      </div>
    </div>
  );
}
