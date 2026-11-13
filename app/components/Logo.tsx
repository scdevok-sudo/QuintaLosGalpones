/**
 * Marca. Archivos en public/brand/. No se redibujan, no se estiran, no cambia su tipografía.
 * "oscuro" va sobre día y "blanco" sobre fotos y fondos noche. Se usan como <img>:
 * si hace falta recolorear con CSS habría que usar logo-quinta-los-galpones.svg inline.
 *
 * Proporciones: logo completo 318.5 x 67 (171 x 36 px a 36 px de alto), isotipo 88 x 67 (47 x 36 px).
 * El logo completo trae el nombre: no se agrega wordmark de texto.
 */
type Props = {
  tone: "oscuro" | "blanco";
  /** Altura en px del logo completo en pantallas anchas. Mínimo recomendado: 36. */
  height?: number;
  className?: string;
};

export function Logo({ tone, height = 36, className = "" }: Props) {
  const w = Math.round((318.5 / 67) * height);
  return (
    <picture className={`inline-flex items-center ${className}`}>
      {/* Por debajo de 340 px de ancho el logo completo cede su lugar al isotipo (solo se pide una variante). */}
      <source media="(max-width: 21rem)" srcSet={`/brand/isotipo-${tone}.svg`} />
      <img
        src={`/brand/logo-${tone}.svg`}
        alt=""
        width={w}
        height={height}
        style={{ height, width: "auto" }}
      />
    </picture>
  );
}
