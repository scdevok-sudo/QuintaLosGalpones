import { useEffect, useRef } from "react";
import { slots, type SlotName } from "@/content/photos";
import { ui } from "@/content/reales";

type Props = { items: SlotName[]; index: number | null; onIndex: (i: number | null) => void };

/**
 * Lightbox sobre <dialog> nativo modal: atrapa el foco y deja el resto inerte, Esc cierra, flechas navegan,
 * swipe horizontal navega, y al cerrar el foco vuelve al botón que lo abrió.
 */
export function Lightbox({ items, index, onIndex }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const startX = useRef<number | null>(null);
  const open = index !== null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal(); // tells-ok: el lightbox es un diálogo modal a propósito
    }
    if (!open && d.open) d.close();
  }, [open]);

  function close() {
    onIndex(null);
    opener.current?.focus();
  }
  const go = (d: number) => index !== null && onIndex((index + d + items.length) % items.length);

  const slot = index !== null && items[index] ? slots[items[index]] : null;
  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={slot?.alt ?? "Foto"}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      {slot && (
        <picture>
          {slot.sources && <source type="image/avif" srcSet={slot.sources.avif} sizes="100vw" />}
          {slot.sources && <source type="image/webp" srcSet={slot.sources.webp} sizes="100vw" />}
          <img src={slot.src} alt={slot.alt} width={slot.width} height={slot.height} draggable={false} />
        </picture>
      )}
      <button type="button" className="lightbox-btn lightbox-close" onClick={close}>
        {ui.cerrar}
      </button>
      {items.length > 1 && (
        <>
          <button type="button" className="lightbox-btn lightbox-prev" onClick={() => go(-1)} aria-label={ui.anterior}>
            <span aria-hidden="true" className="lightbox-arrow lightbox-arrow-prev" />
          </button>
          <button type="button" className="lightbox-btn lightbox-next" onClick={() => go(1)} aria-label={ui.siguiente}>
            <span aria-hidden="true" className="lightbox-arrow" />
          </button>
        </>
      )}
    </dialog>
  );
}
