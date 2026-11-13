import { Link } from "react-router";
import type { Cta } from "@/content/types";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/lib/whatsapp";

type Props = {
  cta: Cta;
  variant?: "primary" | "ghost" | "light";
  className?: string;
};

/** Botón del documento. Los destinos están definidos en el brief (sección 3.2). */
export function Button({ cta, variant = "primary", className = "" }: Props) {
  const cls = `btn btn-${variant} ${className}`;

  if (cta.whatsapp) {
    const ctx = cta.whatsapp;
    return (
      <a
        className={cls}
        href={whatsappLink(ctx)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          track("click_whatsapp", { context: ctx, label: cta.label });
          if (ctx === "visita") track("click_coordinar_visita", { origen: "whatsapp" });
        }}
      >
        {cta.label}
      </a>
    );
  }

  const to = cta.to;
  if (to.startsWith("#")) {
    return (
      <a className={cls} href={to}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link
      className={cls}
      to={to}
      viewTransition
      onClick={() => {
        if (to.includes("#visita")) track("click_coordinar_visita", { origen: "boton" });
      }}
    >
      {cta.label}
    </Link>
  );
}
