import type { LinksFunction } from "react-router";
import { HERO_SIZES, type SlotName, slots } from "@/content/photos";

/**
 * Precarga la foto principal de la página (la del LCP) desde el <head> del HTML prerenderizado:
 * el navegador la pide antes de descubrirla en el cuerpo. `imagesrcset` e `imagesizes` tienen que coincidir
 * con los del <img> para que se reutilice la misma descarga.
 */
export function preloadHero(slot: SlotName): LinksFunction {
  return () => {
    const s = slots[slot];
    if (s.sources) {
      return [
        { rel: "preload", as: "image", type: "image/avif", href: s.src, imageSrcSet: s.sources.avif, imageSizes: HERO_SIZES, fetchPriority: "high" },
      ];
    }
    return [
      {
        rel: "preload",
        as: "image",
        href: s.src,
        imageSrcSet: `${s.src} ${s.width}w`,
        imageSizes: "100vw",
        fetchPriority: "high",
      },
    ];
  };
}
