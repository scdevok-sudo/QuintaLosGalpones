import { useEffect, useState } from "react";
import { slots, type SlotName } from "@/content/photos";

type Props = {
  slot: SlotName;
  /** Ocupa todo el contenedor (position absolute) en vez de reservar aspect-ratio. */
  fill?: boolean;
  /** Imagen del LCP: carga con prioridad y sin lazy. */
  priority?: boolean;
  className?: string;
  /** Difiere la carga: no pide la imagen hasta que se pase `defer={false}`. Sin JS queda en <noscript>. */
  defer?: boolean;
  /** Aplica la máscara de galpón (frontón a dos aguas). */
  mask?: boolean;
  /** La máscara abre el techo al entrar a pantalla (atado al scroll). */
  maskLive?: boolean;
  /** Zoom suave de la foto con hover o foco (solo desktop). */
  zoom?: boolean;
  /** Sobrescribe el alt del slot cuando la foto es decorativa ("" la oculta a lectores de pantalla). */
  alt?: string;
};

export function Photo({ slot, fill, priority, className = "", alt, mask, maskLive, zoom, defer }: Props) {
  const s = slots[slot];
  const [showSlots, setShowSlots] = useState(false);

  // Modo dev ?slots=1: superpone el nombre del slot. Queda fuera del build de producción.
  useEffect(() => {
    if (import.meta.env.DEV) setShowSlots(new URLSearchParams(location.search).has("slots"));
  }, []);

  const style = {
    "--ar-m": `${s.ratio.mobile[0]} / ${s.ratio.mobile[1]}`,
    "--ar-d": `${s.ratio.desktop[0]} / ${s.ratio.desktop[1]}`,
  } as React.CSSProperties;

  return (
    <div className={`ph ${fill ? "ph-fill" : ""} ${mask ? "mask-galpon" : ""} ${maskLive ? "mask-live" : ""} ${zoom ? "zoomable" : ""} ${className}`} style={style}>
      {defer ? (
        <noscript>
          <img
            src={s.src}
            alt={alt ?? s.alt}
            width={s.width}
            height={s.height}
            style={{ objectPosition: `${s.focal.x}% ${s.focal.y}%`, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </noscript>
      ) : (
        <img
          src={s.src}
          alt={alt ?? s.alt}
          width={s.width}
          height={s.height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          {...(priority ? { fetchPriority: "high" as const } : {})}
          style={{ objectPosition: `${s.focal.x}% ${s.focal.y}%` }}
        />
      )}
      {showSlots && <span className="ph-tag">{slot}{s.temp ? " (temp)" : ""}</span>}
    </div>
  );
}
