import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Botón flotante de WhatsApp (solo mobile). Se oculta cuando el formulario o el bloque de
 * contacto están en pantalla (elementos con data-hide-wa), para no tapar nada.
 */
export function WhatsAppFab() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll("[data-hide-wa]"));
    if (!targets.length || !("IntersectionObserver" in window)) {
      setHidden(false);
      return;
    }
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setHidden(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  });

  return (
    <a
      href={whatsappLink("generico")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      onClick={() => track("click_whatsapp", { context: "flotante" })}
      className={`fixed z-30 grid h-14 w-14 place-items-center rounded-full bg-forest text-cream shadow-lg shadow-black/25 ring-2 ring-cream/90 transition-all duration-200 md:hidden ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : ""
      }`}
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden}
    >
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" fill="currentColor">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.19 1.6 6.01L4 29l8.14-1.56a12 12 0 0 0 3.9.64h.01C22.68 28.08 28 22.68 28 16.05 28 9.4 22.68 3 16.04 3Zm0 22.04h-.01a10 10 0 0 1-5.1-1.4l-.37-.22-4.83.93.96-4.7-.24-.38a9.97 9.97 0 0 1-1.53-5.27c0-5.5 4.5-9.97 10.04-9.97 2.68 0 5.2 1.04 7.09 2.93a9.9 9.9 0 0 1 2.93 7.06c0 5.5-4.5 10.02-10.94 10.02Zm5.47-7.47c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.68-1.64-.93-2.25-.25-.58-.5-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.48 1.69.62.7.22 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z" />
      </svg>
    </a>
  );
}
