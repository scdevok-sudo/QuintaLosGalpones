# Mapa de Cómo llegar: informe

## Diagnóstico
El recuadro se veía vacío porque `MapFacade` era una caja plana `noche-2` (mismo color que la sección) con solo texto y un botón: no había ninguna imagen de mapa antes del clic. Los otros dos problemas: sin JS el botón "Ver el mapa" no hacía nada, y "Cómo llegar" armaba la URL por duplicado en Inicio y Contacto.

## Qué cambió
- `npm run map:build` (`scripts/map-build.mjs`): consulta Overpass una sola vez (User-Agent propio, reintentos con espera creciente, caché en `scripts/map-data/overpass.json`; `-- --refresh` para volver a pedir) y genera `public/map/quinta-4x3.svg` (22 KB) y `quinta-16x10.svg` (20 KB) con la paleta del sitio, más las etiquetas en `src/content/mapa.generated.ts`. Las etiquetas son texto HTML (tipografía del sitio) y la atribución "© colaboradores de OpenStreetMap" enlaza a openstreetmap.org/copyright.
- `MapFacade`: imagen estática + pin lamparita (con pulso solo si no hay `prefers-reduced-motion`). "Ver el mapa" es un enlace real a Google Maps; con JS carga el iframe de Google en el mismo lugar, con `title`, `loading="lazy"` y el foco pasa al iframe.
- `src/lib/maps.ts`: `directionsUrl` (`/maps/dir/?api=1&destination=`), `searchUrl` y `embedUrl`, armados desde la dirección; usan las coordenadas solo cuando `validated: true`. Ya no dependen de `mapsUrl`.
- `check:nojs` verifica el mapa estático y los dos enlaces sin JS.

## Para verificar antes de validar
Las coordenadas son **aproximadas**: Nominatim (OSM) solo encuentra la calle Quintino Bocayuva, no el número 655. Son el centro de la calle.

- Latitud: `-34.4168017`
- Longitud: `-58.7164303`
- Enlace: https://www.google.com/maps?q=-34.4168017,-58.7164303

Si el punto cae sobre la puerta de la quinta, poner `validated: true` en `site.coordinates` (entonces los enlaces y el iframe usan coordenadas y el JSON-LD suma `geo`). Si no, corregir `lat`/`lng` y correr `npm run map:build` para mover el pin. Mientras tanto el pin del mapa estático está en ese punto y los enlaces de Google usan la dirección en texto. Distancia medida del punto a Panamericana: 455 m (coherente con "a 500 metros").

## Medición (Lighthouse móvil, mediana de 3, `npm run preview`)
| Ruta | Antes | Después |
|---|---|---|
| Inicio | perf 84, LCP 2,15 s, CLS 0 | perf 89, LCP 2,18 s, CLS 0 |
| Contacto | perf 69, LCP 2,28 s, CLS 0,015 | perf 71, LCP 2,28 s, CLS 0 |

TBT varía mucho entre corridas en esta máquina (Contacto 1,6 a 2,7 s en ambos estados); la imagen del mapa va `lazy` bajo `content-visibility`, no entra en el LCP. Accesibilidad 100 en ambas.

Capturas antes/después en `docs/mapa/` (390 y 1280, Inicio y Contacto). El plan B (foto F052 de fondo) no hizo falta.
