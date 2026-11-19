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

## 3. Mejora de calidad
Los originales no se tocan. Cada foto registra su proceso en `src/data/photos.manifest.json` (`proceso`).
- **Nivel A (aplicado a las 15 fotos en uso)**, `scripts/enhance.py` + enfoque en `photos:build`: reducción de ruido leve (solo si el ruido estimado supera 1,4: aplicó solo en F035), enfoque suave al tamaño final, y exposición y color llevados hacia la mediana del grupo (tope ±0,25 EV y ±4 %). Barrera: si el cambio medio supera 8/255 el build falla (máximo real: 6,2). No quita ni agrega nada.
- **Nivel B (agrandado con IA hasta 2x): no generado.** Disponible en esta máquina: GPU NVIDIA RTX 3050 (6 GB), `torch` 2.12 solo CPU, OpenCV 4.11 sin `dnn_superres`, `onnxruntime`. **No hay `realesrgan-ncnn-vulkan`** ni modelos. Elegibles (sin rostros en primer plano, menos de 2000 px): 11 fotos según el manifiesto (la lista está en `docs/fotos/mejoras/README.md`); excluidas las de rostros (F029, F033). Ver pregunta abajo.

## 4. Hojas de antes y después
`docs/fotos/mejoras/<ID>.jpg` (una por foto, con detalle al 100 %) y `docs/fotos/mejoras/README.md` con la tabla y la recomendación. Recomendación: **aplicar** en 13; **no aplicar** en F015 y F045 (la corrección de exposición llega al tope de -0,25 EV y oscurece el clima de fotos que ya son oscuras). Hoy el Nivel A está aplicado a todas, como pediste; para excluir una: `"mejora": { "nivelA": false }` en su entrada de `fotos` y `npm run photos:build`.

## 5. Verificación
- `photos:verify` OK, `check` OK, `check:launch` sin errores (solo las advertencias de siempre del cliente).
- Lighthouse mobile (mediana de 3): Inicio perf 98, a11y 100, LCP 2,19 s, TBT 123 ms, CLS 0; Casamientos 99/100, LCP 2,19 s, TBT 65 ms, CLS 0; Espacios 99/100, LCP 2,12 s, TBT 81 ms, CLS 0.
- Capturas del recorrido y de Casamientos, Espacios, Contacto y Eventos reales en 1280, 1440 y 1920: `docs/fotos/escritorio/`. Diagnóstico después: 0 de 96 fotos con problema (`docs/fotos/diagnostico-escritorio-despues.md`).

## Pendiente
- Aprobar o no el Nivel B (hay que instalar `realesrgan-ncnn-vulkan`, un zip portable de unos 40 MB que usa la GPU).
- La mayoría de los originales siguen en 1320 px: el split los muestra a 1:1 o menos, pero para pantallas de alta densidad conviene pedir los originales de 2000 px o más.
- Fiesta (F029) y Llegada (F033): rostros sin permiso confirmado.
