# Contraste del recorrido "Un día en Los Galpones"

Medido con `node scripts/screenshots-story.mjs` (preview, 17/11/2026) sobre el texto del panel de cada escena. El texto vive en un panel con superficie propia que cambia en el límite entre escenas; nunca se interpola el color del texto sobre fondo cambiante.

| Viewport | Avance | Escena | Texto | Fondo |
|---|---|---|---|---|
| 390 | 2 % | Llegada | tinta #231b13 | tarde #e9e6d2 |
| 390 | 25 % | Ceremonia | tinta | tarde |
| 390 | 50 % | Ceremonia | tinta | tarde |
| 390 | 75 % | Noche | tarde #e9e6d2 | noche #151d18 |
| 390 | 98 % | Noche | tarde | noche |
| 1280 | 2 % | Llegada | tinta | tarde |
| 1280 | 25 % | Llegada | tinta | tarde |
| 1280 | 50 % | Ceremonia | tinta | tarde |
| 1280 | 75 % | Fiesta | tarde | noche |
| 1280 | 98 % | Noche | tarde | noche |

Razones de contraste calculadas (WCAG): tinta sobre tarde 13,5:1; tarde sobre noche 13,7:1. Ambas pasan AAA.

Observación de axe-core: marca como contraste insuficiente el primer `<span>` del reloj decorativo (`.clock-strip`, `aria-hidden`) en Inicio. La captura (`story-inicio.png`) muestra el reloj legible sobre su chip claro; se considera falso positivo de un elemento oculto por `overflow` y desplazado con `transform`. No verificado con lector de pantalla.
