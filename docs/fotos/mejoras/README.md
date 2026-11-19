# Mejora técnica de fotos: antes y después

Una hoja por foto (`<ID>.jpg`): a la izquierda el original sin tocar, a la derecha el mismo recorte con el Nivel A, y el detalle al 100 %.
Los originales no se modifican. Se regeneran con `npm run photos:build` y `node scripts/photos-mejoras.mjs`.

## Nivel A (aplicado a todas menos F015 y F045)
Reducción de ruido leve (solo si el ruido estimado supera 1.4), enfoque suave al tamaño final y exposición y color consistentes entre fotos (ajuste de hasta ±0.25 EV y ±4 % de color hacia la mediana del grupo). No quita ni agrega objetos, luces, personas ni cielos; no retoca manchas. La barrera de `photos:build` y `photos:verify` falla si el cambio medio supera 8/255.

| Foto | Original | Ruido estimado | Reducción de ruido | Exposición (EV) | Color R/G/B | Cambio medio | Recomendación |
|---|---|---|---|---|---|---|---|
| [F027](F027.jpg) | 1320x1755 | 1.17 | no | -0.23 | 0.96/1/1.04 | 5.35 | **aplicar** |
| [F028](F028.jpg) | 1320x1961 | 1.16 | no | -0.25 | 1/1/1.04 | 5.2 | **aplicar** |
| [F029](F029.jpg) | 1320x1745 | 1.11 | no | 0.004 | 0.96/1/0.96 | 0.5 | **aplicar** |
| [F032](F032.jpg) | 1320x1493 | 1.11 | no | 0.25 | 1/1/1.04 | 5.59 | **aplicar** |
| [F033](F033.jpg) | 1320x2327 | 0.89 | no | 0.25 | 1.04/1/0.96 | 3.64 | **aplicar** |
| [F035](F035.jpg) | 1320x939 | 2.27 | 1.27 | 0.25 | 0.96/1/1 | 5.2 | **aplicar** |
| [F037](F037.jpg) | 1320x1756 | 1.11 | no | 0.047 | 1.0285/1/0.9742 | 1.06 | **aplicar** |
| [F041](F041.jpg) | 1320x2322 | 0.73 | no | -0.25 | 1.0375/1/1 | 3.49 | **aplicar** |
| [F043](F043.jpg) | 1320x1762 | 1.08 | no | 0 | 1.04/1/0.96 | 0.59 | **aplicar** |
| [F047](F047.jpg) | 1320x1971 | 0.8 | no | 0.25 | 1.04/1/0.96 | 2.75 | **aplicar** |
| [F048](F048.jpg) | 1320x1960 | 1.1 | no | 0.25 | 0.96/1/1.0022 | 4.15 | **aplicar** |
| [F052](F052.jpg) | 1320x1974 | 0.63 | no | 0 | 0.96/1/1.04 | 0.53 | **aplicar** |
| [F057](F057.jpg) | 4284x5712 | 0.65 | no | -0.25 | 1.04/1/0.96 | 5.68 | **aplicar** |



- **F015**: sin Nivel A, por decisión del cliente (la hoja `F015.jpg` es de cuando se evaluó: la exposición llega al tope de -0,25 EV y oscurece fotos que ya son oscuras).
- **F045**: sin Nivel A, por decisión del cliente (la hoja `F045.jpg` es de cuando se evaluó: la exposición llega al tope de -0,25 EV y oscurece fotos que ya son oscuras).

## Nivel B (agrandado con IA hasta 2x): generado, NO aplicado
Herramienta: Real-ESRGAN (`realesrgan-ncnn-vulkan` 20220424, release oficial v0.2.5.0 de xinntao/Real-ESRGAN; el release no publica hash, se verificó el tamaño contra el asset: 45474481 bytes; SHA-256 `abc02804e17982a3be33675e4d471e91ea374e65b70167abc09e31acb412802d`), instalada fuera del repo en `~/tools/realesrgan`, modelo `realesrgan-x4plus` reducido a 2x con Lanczos. Solo fotos sin rostros en primer plano y de menos de 2000 px. Las candidatas están en `.photos-upscaled/` (fuera de git); las hojas de comparación (ampliación clásica 2x contra IA, detalles al 100 %) en `nivel-b/<ID>.jpg`.

Para aprobar una: `"mejora": { "nivelB": "aplicar" }` en su entrada de `fotos` y `npm run photos:build` (el original sigue intacto; `photos:verify` falla si hay Nivel B aplicado sin esa marca o sobre una foto con rostros).

| Foto | Recomendación | Motivo |
|---|---|---|
| [F027](nivel-b/F027.jpg) | **aplicar** | madera y vidrio más definidos, sin artefactos |
| [F028](nivel-b/F028.jpg) | **aplicar** | cubiertos, copas y follaje más nítidos; ganancia clara |
| [F032](nivel-b/F032.jpg) | **aplicar** | pasto y sillas más definidos; ganancia clara |
| [F035](nivel-b/F035.jpg) | **aplicar** | invitados de espaldas más nítidos; sin rostros |
| [F037](nivel-b/F037.jpg) | **aplicar** | flores, vela y vajilla con mucho más detalle |
| [F041](nivel-b/F041.jpg) | **aplicar** | mejora mínima (madera oscura); inocua |
| [F043](nivel-b/F043.jpg) | **no aplicar** | se ven rostros en segundo plano y la IA los reconstruye: puede inventar facciones |
| [F045](nivel-b/F045.jpg) | **aplicar** | flores y velas más definidas (la foto no lleva Nivel A) |
| [F047](nivel-b/F047.jpg) | **aplicar** | mejora mínima (madera oscura); inocua |
| [F048](nivel-b/F048.jpg) | **aplicar** | flores, sillas y mantel más definidos |
| [F052](nivel-b/F052.jpg) | **aplicar** | pareja de espaldas: sin rostros; textura del follaje más limpia |
