import { useEffect, useState } from "react";
import { HERO_SIZES, slots, type SlotName } from "@/content/photos";

type Props = {
  slot: SlotName;
  /** Ocupa todo el contenedor (position absolute) en vez de reservar aspect-ratio. */
  fill?: boolean;
  /** Imagen del LCP: carga con prioridad y sin lazy. */
  priority?: boolean;
  className?: string;
  /** Difiere la carga: no pide la imagen hasta que se pase `defer={false}`. Sin JS queda en <noscript>. */
  defer?: boolean;
  /** La foto espera a la hidratación (después del LCP) para no competir con la foto principal. */
  later?: boolean;
  /** Máscara de galpón (frontón a dos aguas). Solo en el hero (anexo v2.3). */
  mask?: boolean;
  /** Zoom de 1,02 con hover o foco (solo desktop). */
  zoom?: boolean;
  /** Sobrescribe el alt del slot cuando la foto es decorativa ("" la oculta a lectores de pantalla). */
  alt?: string;
  /** `sizes` del <img>. Por defecto: el hero ocupa el contenedor; el resto, mitad de pantalla en desktop. */
  sizes?: string;
};

export function Photo({ slot, fill, priority, className = "", alt, mask, zoom, defer, later, sizes }: Props) {
  const s = slots[slot];
  const [showSlots, setShowSlots] = useState(false);
  // `later`: la foto no se pide hasta que hidrata la página, que el cargador diferido arranca después del LCP.
  // Así nada compite con la foto del LCP. Sin JS queda en <noscript>.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  // Modo dev ?slots=1: superpone el nombre del slot. Queda fuera del build de producción.
  useEffect(() => {
    if (import.meta.env.DEV) setShowSlots(new URLSearchParams(location.search).has("slots"));
  }, []);

  const style: Record<string, string> = {
    "--ar-m": `${s.ratio.mobile[0]} / ${s.ratio.mobile[1]}`,
    "--ar-d": `${s.ratio.desktop[0]} / ${s.ratio.desktop[1]}`,
  };
  if (s.bleed) style["--ar-b"] = `${s.bleed[0]} / ${s.bleed[1]}`;
  if (s.lqip) style.backgroundImage = `url(${s.lqip})`;
  const sz = sizes ?? (priority ? HERO_SIZES : "(min-width: 1024px) 50vw, 100vw");
  const pos = `${s.focal.x}% ${s.focal.y}%`;

  return (
    <div
      className={`ph ${s.bleed ? "ph-bleedable" : ""} ${fill ? "ph-fill" : ""} ${mask ? "mask-galpon" : ""} ${zoom ? "zoomable" : ""} ${className}`}
      style={style as React.CSSProperties}
    >
      {(defer ?? (later && !ready)) ? (
        <noscript>
          <img
            src={s.src}
            alt={alt ?? s.alt}
            width={s.width}
            height={s.height}
            style={{ objectPosition: pos, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </noscript>
      ) : (
        <picture>
          {s.sources && <source type="image/avif" srcSet={s.sources.avif} sizes={sz} />}
          <img
            src={s.src}
            alt={alt ?? s.alt}
            width={s.width}
            height={s.height}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            {...(priority ? { fetchPriority: "high" as const } : {})}
            {...(!s.sources && priority ? { srcSet: `${s.src} ${s.width}w`, sizes: "100vw" } : {})}
            style={{ objectPosition: pos }}
          />
        </picture>
      )}
      {showSlots && (
        <span className="ph-tag">
          {slot}
          {s.temp ? " (temp)" : ""}
          {s.estado ? ` (${s.estado})` : ""}
        </span>
      )}
    </div>
  );
}
