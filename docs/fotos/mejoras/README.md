# Mejora técnica de fotos: antes y después

Una hoja por foto (`<ID>.jpg`): a la izquierda el original sin tocar, a la derecha el mismo recorte con el Nivel A, y el detalle al 100 %.
Los originales no se modifican. Se regeneran con `npm run photos:build` y `node scripts/photos-mejoras.mjs`.

## Nivel A (aplicado a todas)
Reducción de ruido leve (solo si el ruido estimado supera 1.4), enfoque suave al tamaño final y exposición y color consistentes entre fotos (ajuste de hasta ±0.25 EV y ±4 % de color hacia la mediana del grupo). No quita ni agrega objetos, luces, personas ni cielos; no retoca manchas. La barrera de `photos:build` y `photos:verify` falla si el cambio medio supera 8/255.

| Foto | Original | Ruido estimado | Reducción de ruido | Exposición (EV) | Color R/G/B | Cambio medio | Recomendación |
|---|---|---|---|---|---|---|---|
| [F015](F015.jpg) | 1320x1769 | 0.9 | no | -0.25 | 1.04/1/1.0166 | 6.16 | **no aplicar** |
| [F027](F027.jpg) | 1320x1755 | 1.17 | no | -0.23 | 0.96/1/1.04 | 5.35 | **aplicar** |
| [F028](F028.jpg) | 1320x1961 | 1.16 | no | -0.25 | 1/1/1.04 | 5.2 | **aplicar** |
| [F029](F029.jpg) | 1320x1745 | 1.11 | no | 0.004 | 0.96/1/0.96 | 0.5 | **aplicar** |
| [F032](F032.jpg) | 1320x1493 | 1.11 | no | 0.25 | 1/1/1.04 | 5.59 | **aplicar** |
| [F033](F033.jpg) | 1320x2327 | 0.89 | no | 0.25 | 1.04/1/0.96 | 3.64 | **aplicar** |
| [F035](F035.jpg) | 1320x939 | 2.27 | 1.27 | 0.25 | 0.96/1/1 | 5.2 | **aplicar** |
| [F037](F037.jpg) | 1320x1756 | 1.11 | no | 0.047 | 1.0285/1/0.9742 | 1.06 | **aplicar** |
| [F041](F041.jpg) | 1320x2322 | 0.73 | no | -0.25 | 1.0375/1/1 | 3.49 | **aplicar** |
| [F043](F043.jpg) | 1320x1762 | 1.08 | no | 0 | 1.04/1/0.96 | 0.59 | **aplicar** |
| [F045](F045.jpg) | 1320x1978 | 0.88 | no | -0.25 | 0.96/1/1.04 | 6.23 | **no aplicar** |
| [F047](F047.jpg) | 1320x1971 | 0.8 | no | 0.25 | 1.04/1/0.96 | 2.75 | **aplicar** |
| [F048](F048.jpg) | 1320x1960 | 1.1 | no | 0.25 | 0.96/1/1.0022 | 4.15 | **aplicar** |
| [F052](F052.jpg) | 1320x1974 | 0.63 | no | 0 | 0.96/1/1.04 | 0.53 | **aplicar** |
| [F057](F057.jpg) | 4284x5712 | 0.65 | no | -0.25 | 1.04/1/0.96 | 5.68 | **aplicar** |

- **F015** (no aplicar): la corrección de exposición llega al tope (EV -0.25) y cambia el clima de la foto (cambio medio 6.16/255): conviene revisarla con el cliente antes
- **F045** (no aplicar): la corrección de exposición llega al tope (EV -0.25) y cambia el clima de la foto (cambio medio 6.23/255): conviene revisarla con el cliente antes

## Nivel B (agrandado con IA hasta 2x): generado solo si lo aprobás, no aplicado
Pendiente: no hay herramienta instalada (ver INFORME-ESCRITORIO.md). Fotos elegibles (sin rostros en primer plano y menos de 2000 px): F027, F028, F032, F035, F037, F041, F043, F045, F047, F048, F052. Excluidas por tener rostros: F015, F029, F033.
