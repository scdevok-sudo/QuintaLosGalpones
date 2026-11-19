# Escritorio: dirección de arte, calidad de fotos y verificación

## 1. Diagnóstico (antes)
Capturas de todas las fotos a 1280x800, 1440x900 y 1920x1080 en `docs/fotos/diagnostico-escritorio-antes.md` (`node scripts/photos-diag.mjs`). Lo que se veía mal:
- **Recorrido (las 4 escenas, los 3 tamaños): el problema principal.** La foto llenaba todo el escenario (1434 a 2150 px de ancho) con un recorte apaisado 2:1 de originales verticales de 1320 px, más un zoom de 1,12 de parallax. Resultado: ampliación de 1,9x a 2,5x (muy blanda) y recorte excesivo (Ceremonia perdía 32 a 35 % del alto; las cabezas de los invitados quedaban cortadas). Además el navegador elegía el archivo de 640 px porque el `sizes` suponía "mitad de pantalla".
- Resto de las páginas: 3 fotos levemente blandas a 1280 px (1,06x) por el mismo `sizes` corto; fotos verticales recortadas a 4:3 (perdían 40 % del alto); Casamientos Lluvia y Espacios Cubierto con una vertical metida en columna ancha.
- Eventos reales: sin problemas de ampliación (fotos provisorias de 1024 px, se muestran a 392 a 796 px).

## 2. Dirección de arte de escritorio
`photos.config.json`: cada ranura admite `mobile`, `desktop` (desde 1024 px) y `wide` (desde 1600 px, hereda de desktop) como relación `[a, b]` (recorte base, como antes) o como objeto `{ aspect, focal, maxWidth, layout, base }`. Está documentado en `_nota`.
- `layout: cover` llena el contenedor; `split` pone la vertical a la altura de la ventana (80 vh) junto al texto, centrada sobre la superficie; `mosaico` junta 2 o 3 verticales (`fotos` suma las otras, cada una con su `aspect` y `focal`).
- **Tope de ancho**: para recortes de menos de 2000 px el ancho renderizado máximo es el del recorte (1:1 en pantallas de 1x). `maxWidth` puede bajarlo; `photos:build` falla si lo sube. Las provisorias (`photos-temp`) también quedan topadas a su ancho.
- `sizes` correcto por layout (antes el recorrido pedía el archivo de 640 px).

| Ranura | Antes | Ahora |
|---|---|---|
| Recorrido: Llegada, Ceremonia, Fiesta, Noche | apaisado 2:1 a pantalla completa, zoom 1,12 | split 4:5: texto sobre la superficie del tema y la vertical a la altura de la escena, sin parallax de escala |
| Casamientos hero | recorte 3:2 y ventana 16:9 | recorte propio 16:9 desde el original de 4284 px |
| Casamientos servicios | 4:3 de una vertical | split 4:5 |
| Casamientos lluvia | 4:3 | mosaico de 2 verticales 3:4 (F045 + F037), el segundo desplazado |
| Espacios hero | 16:9 de una vertical | cabecera en dos columnas, split 4:5 (en `wide` 3:4) |
| Espacios parque / cubierto / ceremonia / llegada | 4:3 | split 9:10 / 3:4 (con máscara de galpón) / 4:5 / 3:4 |
| Contacto entrada | 4:3 | split 4:5 |
| Contacto hero | cover 3:2 (horizontal) | sin cambio, con tope de ancho |
| Eventos reales | grilla | sin cambio de fotos: todas son provisorias horizontales de 1024 px; ya no se agrandan (tope 1:1). Los layouts split y mosaico quedan listos para cuando haya verticales aprobadas |

`photos:build` y `photos:verify` comprueban el sujeto entero a **1280, 1440 y 1920 px** (y mobile, como antes), también el de cada foto de un mosaico. Probado: un recorte que corta el sujeto hace fallar `photos:verify`. Resultado actual: 20 ranuras verificadas en cada tamaño de escritorio.

## 3. Layout "auto" (pantalla completa cuando la foto lo aguanta)
`layout: "auto"` es el valor por defecto de `desktop`. `photos:build` mide el agrandado a 1920 px: ancho renderizado (de `npm run photos:measure`, por el zoom del recorrido si hay) dividido por el ancho del recorte publicado a pantalla completa. Hasta 1,35x (`layoutAuto.agrandadoMax`) la ranura va a **cover** con tope de ancho de 1,35x el recorte; si no, cae a su `fallback` (`split` por defecto, o `ambient`) con `aspect` y `focal`, y `cover: { aspect, focal }` es el recorte a pantalla completa. Al reemplazar un original por uno mejor la ranura pasa sola a cover, sin tocar código. La tabla completa se imprime en cada `photos:build` y queda en `docs/fotos/layout-auto.md`. Resumen:

| Ranura | Agrandado a 1920 | Layout |
|---|---|---|
| story.llegada / fiesta / noche (1320 px) | 1,63x | split (auto) |
| story.ceremonia (4284 px) | 0,50x | **cover (auto)** |
| casamientos.hero (4284 px) | 0,28x | cover (explícito) |
| resto de las ranuras en columna | 0,13x a 0,63x | las verticales fijadas en split o mosaico (explícito) y las horizontales en cover |

Decisión mía a confirmar: las ranuras en columna angosta con originales verticales quedaron **explícitas** en split o mosaico. Con la regla de agrandado darían cover (el agrandado es chico), pero cover recortaría la vertical a 4:3, que era el problema original. Si querés que también sean "auto", se saca el `layout` de su entrada.

## 4. Recorrido: tres variantes a 1920x1080 para elegir
`npm run story:variantes` arma las 4 escenas en cada variante sobre la página real: **cover** (pantalla completa, recorte 19:10, ampliado a 1,63x en las de 1320 px), **split** (la actual) y **ambient** (vertical nítida centrada, costados con la misma foto desenfocada y tintada). Hoja comparativa: `docs/fotos/escritorio/recorrido-1920-variantes.jpg`; capturas individuales `recorrido-1920-<variante>-escena<N>.jpg`. Ambient ya está implementado (`layout: "ambient"` o `fallback: "ambient"`). Mi lectura: en cover las escenas de 1320 px se ven blandas (la 2, de 4284 px, se ve muy bien); ambient funciona en las nocturnas (3 y 4) y queda sucio en las diurnas (1 y 2).

## 5. Mejora de calidad
Los originales no se tocan y el manifiesto registra el proceso de cada foto (`proceso`).
- **Nivel A**: aplicado a 13 fotos; **F015 y F045 quedan sin aplicar** (`"mejora": {"nivelA": false}`). Reducción de ruido leve (solo F035 lo necesitaba), enfoque suave al tamaño final, exposición y color hacia la mediana del grupo (tope ±0,25 EV y ±4 %). Barrera: cambio medio máximo 8/255.
- **Nivel B**: instalado `realesrgan-ncnn-vulkan` 20220424 (release oficial v0.2.5.0 de xinntao/Real-ESRGAN) en `C:/Users/Santi/tools/realesrgan`, fuera del repo y sin tocar el sistema. El release no publica hash; verifiqué el tamaño contra el asset (45474481 bytes) y registré el SHA-256 `abc02804e17982a3be33675e4d471e91ea374e65b70167abc09e31acb412802d`. Generadas 11 candidatas a 2x (F027, F028, F032, F035, F037, F041, F043, F045, F047, F048, F052) en `.photos-upscaled/` (fuera de git), solo fotos sin rostros en primer plano y de menos de 2000 px. **No se aplicó ninguna.** Hojas en `docs/fotos/mejoras/nivel-b/<ID>.jpg`; recomendación en `docs/fotos/mejoras/README.md`: aplicar 10, no aplicar F043 (se ven rostros en segundo plano y la IA los reconstruye). Para aprobar una: `"mejora": {"nivelB": "aplicar"}` en su entrada y `npm run photos:build` (`photos:verify` falla si hay Nivel B aplicado sin esa marca o con rostros). Al aplicarla, esas ranuras podrán pasar a cover por el layout auto.
- Hojas de antes y después del Nivel A: `docs/fotos/mejoras/<ID>.jpg`.

## 6. Verificación
- `photos:verify` OK (sujeto entero en 1280, 1440 y 1920 en 21 ranuras), `check` OK, `check:launch` sin errores (solo las advertencias de siempre del cliente).
- Lighthouse mobile (mediana de 3 a 5 corridas): Inicio perf 97, a11y 100, LCP 2,19 s, TBT 148 a 164 ms, CLS 0; Casamientos 96 a 99; Espacios 98; accesibilidad 100 y CLS 0 en las tres. El TBT varía entre corridas (una serie dio 88 y se normalizó al repetirla).
- Capturas del recorrido y de Casamientos, Espacios, Contacto y Eventos reales en 1280, 1440 y 1920: `docs/fotos/escritorio/`. Diagnóstico después: 1 de 96 (la escena Ceremonia a 1920 px, 1,2x, dentro del tope de 1,35x del layout auto) (`docs/fotos/diagnostico-escritorio-despues.md`).

## Pendiente
- Elegir la variante del recorrido (cover, split o ambient) y aprobar el Nivel B foto por foto.
- La mayoría de los originales siguen en 1320 px: el split los muestra a 1:1 o menos, pero para pantallas de alta densidad conviene pedir los originales de 2000 px o más.
- Fiesta (F029) y Llegada (F033): rostros sin permiso confirmado.
