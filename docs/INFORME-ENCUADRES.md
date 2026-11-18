# Encuadres por breakpoint y recorrido compacto

## Causas de lo que se veía mal
- **Ceremonia (F046)**: el original es vertical (1312x2140) y se publicaba recortado en 7:4 apaisado con foco y=0,39: salía la franja de palmera y cielo; las personas están en el tercio inferior.
- **Fiesta (F049)**: era el árbol con guirnaldas; el texto habla del espacio cubierto.
- **General**: casi todos los originales son verticales y cada foto se publicaba con un solo recorte que después CSS volvía a recortar según el contenedor, sin saber dónde estaba el sujeto.
- **Bloque fijo**: banda de 125 px en tres filas, la barra "Consultar por mi fecha" tapaba el pie del escenario y el texto se apoyaba encima de la foto: la foto visible medía 224 a 429 px (30 a 47 % de la pantalla).

## Qué cambió
- `photos.config.json`: cada foto lleva `subject` (caja del sujeto, fracciones 0 a 1 del original). Cada ranura admite `mobile: { aspect, focal, maxWidth }` (recorte propio), `vistas` (relación real del contenedor por ancho de ventana), `zoom` (parallax del recorrido) y `subject`/`mobileSubject` propios si la ranura muestra otra cosa.
- `photos:build` genera las variantes mobile (`...-mob-<ranura>-wN.avif`) y **falla** si el recorte base, el recorte mobile o lo que realmente se ve en alguna ranura a 360, 390, 412, 768 o 1280 px no contiene el sujeto entero. `photos:verify` repite la comprobación desde el manifiesto y revisa los archivos mobile.
- `<picture>` con `<source media="(max-width: Npx)">` para el recorte mobile (también en el `<noscript>`).
- Recorrido en mobile y tablet: reloj y pestañas en una fila (65 px en vez de 125), guirnalda superpuesta a la foto, la barra inferior fuera del escenario, y el texto debajo de la foto: la foto ocupa 50 % (360x740), 56 % (390x844), 59 % (412x915) y 73 % (768x1024) del alto. Escritorio sin cambios.
- Recorrido: Ceremonia usa F057 (pasillo de flores con invitados) y Fiesta usa F029 (galpón de noche con techo de luces e invitados).
- Con la verificación se corrigieron focos que cortaban el pie de varias fotos (F001, F004, F005, F028, F037, F041, F045 y otras) y subjects mal dimensionados.

## Revisión
- `npm run photos:sheet`: `docs/fotos/hoja-ranuras-1..3.jpg` (cada ranura a los 5 tamaños con el sujeto marcado) y `docs/fotos/alternativas-ceremonia-fiesta.jpg`.
- `docs/fotos/recorrido-<tamaño>-antes-despues.jpg`: las cuatro escenas antes y después en los cinco tamaños. `node scripts/story-shots.mjs <carpeta>` las regenera.
- Lighthouse Inicio (mediana de 3, mismo momento): antes perf 93, LCP 2,12 s, TBT 282 ms; después perf 97, LCP 2,12 s, TBT 171 ms; CLS 0; accesibilidad 100.

## Alternativas analizadas
| Escena | Opciones | Elegida |
|---|---|---|
| Ceremonia | A: F057 pasillo de flores con invitados (original 4284x5712, sin rostros, procedencia sin dudas). B: F046 reencuadrada en invitados bajo guirnaldas y palmera (no es una ceremonia). | A |
| Fiesta | A: F029 galpón de noche con techo de luces e invitados (muestra el espacio cubierto con luces). B: F009 bolas espejadas y luces, sin gente (935 px, procedencia sin confirmar). | A |

## Pendiente del cliente
- **Fiesta (F029)** queda **provisoria**: rostros sin permiso confirmado y resolución baja (1320 px de ancho). Pedir: la foto original, sin retoque, de la fiesta en el galpón (idealmente apaisada y de 3000 px o más), y la autorización de quienes aparecen o una toma sin rostros.
- **Ceremonia (F057)** es la misma foto que el hero de Casamientos y Espacios: pedir otra toma de la ceremonia (con otro ángulo) si se quiere evitar la repetición.
- Llegada y Noche (F033, F048) siguen con resolución baja y se ven algo blandas en pantallas grandes.
- Las ranuras que todavía usan fotos provisorias del sitio actual (`photos-temp`) no pasan por esta verificación hasta tener foto nueva.
