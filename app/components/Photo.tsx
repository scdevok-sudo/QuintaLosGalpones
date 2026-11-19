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

  const art = s.art;
  const style: Record<string, string> = {
    "--ar-m": `${s.ratio.mobile[0]} / ${s.ratio.mobile[1]}`,
    "--ar-d": `${s.ratio.desktop[0]} / ${s.ratio.desktop[1]}`,
  };
  if (s.bleed) style["--ar-b"] = `${s.bleed[0]} / ${s.bleed[1]}`;
  if (s.lqip) style.backgroundImage = `url(${s.lqip})`;
  // Escritorio (de 1024 px): relación y tope de ancho del recorte propio. Sin recorte propio, el tope es el del recorte base.
  if (art) {
    style["--ar-x"] = `${art.ratio[0]} / ${art.ratio[1]}`;
    style["--ar-n"] = `${art.ratio[0] / art.ratio[1]}`;
    if (art.wide) {
      style["--ar-w"] = `${art.wide.ratio[0]} / ${art.wide.ratio[1]}`;
      style["--ar-wn"] = `${art.wide.ratio[0] / art.wide.ratio[1]}`;
    }
  }
  const cap = art ? (art.layout === "mosaico" ? null : art.maxWidth) : s.maxWidth;
  if (cap) style["--mw-d"] = `${cap}px`;
  if (art?.cells) style["--cells"] = String(art.cells.length);
  // Por defecto el contenedor mide la mitad de la pantalla; un recorte propio sabe su ancho: vertical a la altura de la ventana
  // (split), el tope de ancho o la mitad de la pantalla (cover), una parte por foto (mosaico).
  const R = art?.ratio ? art.ratio[0] / art.ratio[1] : 1;
  const mw = cap ?? 4000;
  const artSizes =
    art?.layout === "split"
      ? `min(calc(80vh * ${R.toFixed(3)}), ${mw}px, 100vw)`
      : art?.layout === "mosaico"
        ? `min(calc(${Math.round(60 / (art.cells?.length ?? 2))}vw), ${mw}px)`
        : `min(${priority ? "1200px" : "60vw"}, ${mw}px)`;
  const sz = sizes ?? (priority ? HERO_SIZES : "(min-width: 1024px) min(60vw, 720px), 100vw");
  const szArt = sizes ?? `(min-width: 1024px) ${artSizes}, 100vw`;
  const pos = `${s.focal.x}% ${s.focal.y}%`;
  // Dirección de arte: hasta `maxWidth` px se usa el recorte mobile de la ranura (su encuadre ya va centrado en el sujeto).
  const mobileSource = s.mobile && <source media={`(max-width: ${s.mobile.maxWidth}px)`} type="image/avif" srcSet={s.mobile.avif} sizes="100vw" />;
  // De 1024 px: recorte propio de escritorio (wide desde 1600 px). Va después del mobile y antes del base: gana la primera que coincide.
  const artSources = art && (
    <>
      {art.wide && <source media="(min-width: 1600px)" type="image/avif" srcSet={art.wide.avif} sizes={szArt} />}
      {art.desktop && <source media="(min-width: 1024px)" type="image/avif" srcSet={art.desktop.avif} sizes={szArt} />}
    </>
  );
  // Mosaico: las demás fotos del conjunto solo existen de 1024 px (en pantallas chicas queda la foto de la ranura).
  const extraCells = art?.cells?.slice(1).map((c, i) => (
    <div key={i} className="ph-cell ph-cell-x" style={{ "--car": `${c.ratio[0]} / ${c.ratio[1]}`, ...(c.maxWidth ? { "--mw-c": `${c.maxWidth}px` } : {}) } as React.CSSProperties}>
      <picture>
        <source type="image/avif" srcSet={c.avif} sizes={szArt} />
        <img src={c.avif.split(" ")[0]} alt={c.alt} loading="lazy" decoding="async" width={c.ratio[0] * 100} height={c.ratio[1] * 100} />
      </picture>
    </div>
  ));

  return (
    <div
      data-mv={s.mobile?.maxWidth}
      data-slot={slot}
      data-layout={art?.layout}
      data-art={art ? "" : undefined}
      data-wide={art?.wide ? "" : undefined}
      data-cap={cap ? "" : undefined}
      className={`ph ${s.bleed ? "ph-bleedable" : ""} ${fill ? "ph-fill" : ""} ${mask ? "mask-galpon" : ""} ${zoom ? "zoomable" : ""} ${className}`}
      style={style as React.CSSProperties}
    >
      {(defer ?? (later && !ready)) ? (
        <noscript>
          <div className="ph-cell">
            <picture>
              {mobileSource}
              {artSources}
              <img
                src={s.src}
                alt={alt ?? s.alt}
                width={s.width}
                height={s.height}
                style={{ "--pos": pos, width: "100%", height: "100%", objectFit: "cover" } as React.CSSProperties}
              />
            </picture>
          </div>
          {extraCells}
        </noscript>
      ) : (
        <>
          <div className="ph-cell" style={art?.cells?.[0] ? ({ "--car": `${art.cells[0].ratio[0]} / ${art.cells[0].ratio[1]}`, ...(art.cells[0].maxWidth ? { "--mw-c": `${art.cells[0].maxWidth}px` } : {}) } as React.CSSProperties) : undefined}>
            <picture>
              {mobileSource}
              {artSources}
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
                style={{ "--pos": pos } as React.CSSProperties}
              />
            </picture>
          </div>
          {extraCells}
        </>
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
