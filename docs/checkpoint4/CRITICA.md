# Crítica del checkpoint 4 (método impeccable)

Modo: **Persuadir** (landing de una quinta de eventos). Evidencia: capturas y videos de esta carpeta, `check:tells`, `check:nojs`, `check-motion`, `measure:tap`, Lighthouse móvil.

## Veredicto de especificidad
Específico del lugar. La paleta (tarde, tinta, noche, lamparita, madera), el recorrido de día a noche y el techo a dos aguas del hero no los puede usar otra marca sin cambios. Después del recorte, lo que queda es menos y se nota más.

## Fortalezas
1. **Un solo momento autorado.** Con el recorrido y la entrada del hero como únicos efectos grandes, y los dos caminos reducidos a 2 px y 1,02, la página dejó de competir consigo misma.
2. **La consulta ya no interrumpe.** Panel no modal: la página sigue con scroll, no hay velo ni trampa de foco, Esc cierra y el foco vuelve al botón (`consulta-*-scroll-con-panel.png`).
3. **Superficies del navegador tematizadas** (selección invertida por superficie, caret madera, scrollbar, foco con `--focus` día/noche). Es la señal más barata de página construida.

## Problemas prioritarios
1. **Panel mobile demasiado alto.** Ocupa ~78 % de la pantalla con el paso 1 abierto; es no modal de nombre y casi modal a la vista. Compactar (tipo de evento en una fila, invitados en un selector) o partir el paso 1 en dos.
2. **Testimonios: grilla de 3 con 2 testimonios, ambos con `approved: false`.** La página los muestra igual (el flag no se filtra). Hace falta un tercero real y autorizado, y filtrar por `approved`.
3. **Sin JS el CTA lleva a `/contacto/`, que todavía no existe** (404 en este checkpoint). El enlace es real y está verificado, pero el destino llega con la página de Contacto.
4. **Repetición de la visita.** "Coordinar una visita" más "Cómo llegar" aparecen en la segunda pantalla y otra vez en el cierre con el mapa. Elegir: o el cierre pasa a ser solo consulta + mapa, o se quita el bloque nuevo del cierre.
5. **Aire muerto entre el hero y el bloque de visita** (unos 230 px en desktop a 1280). Bajar el padding de la sección o subir el bloque al hero.

## Observaciones menores
- El panel en desktop flota abajo a la derecha: no hay barra a la cual anclarse (la barra es solo mobile). Si querés ancla también en desktop hay que mostrar una barra mínima.
- Quedan dos H2 de igual peso en los caminos; funciona, pero Casamientos pierde la jerarquía que tenía antes.
- La máscara de galpón sigue en el hero. Es la firma de marca; solo se mantiene porque el brief la fija ahí.
- El CTA se corre unos px cuando entra la fuente del cuerpo; conviene medirlo si CLS vuelve a importar.

## Heurísticas de Nielsen (0 a 4)
| # | Heurística | Nota | Nota |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | CTA con `aria-busy` si se toca antes de hidratar |
| 2 | Lenguaje del usuario | 4 | Verbos del cliente, sin "Enviar" |
| 3 | Control y libertad | 4 | Esc, Cerrar, Volver; página viva con el panel abierto |
| 4 | Consistencia | 3 | Dos cards parejas; falta unificar la visita repetida |
| 5 | Prevención de errores | 3 | Fecha con "todavía no tengo", validación con salida |
| 6 | Reconocer antes que recordar | 3 | Barra fija con la acción principal |
| 7 | Flexibilidad | 3 | WhatsApp o mensaje; enlaces reales sin JS |
| 8 | Estética minimalista | 3 | Mejoró con el recorte; panel mobile pesado |
| 9 | Recuperación de errores | 3 | Error con salida por WhatsApp |
| 10 | Ayuda | n/a | |

Carga cognitiva: el paso 1 muestra 3 + 4 + fecha en una pantalla (alerta). Recorrido emocional: el pico es el recorrido de día a noche; el final es el cierre con mapa, correcto pero repetido.

## Evidencia técnica (separada del juicio)
- `check:tells` OK con las reglas nuevas (carrusel, contador, magnético, barra solar, pin, máscara fuera del hero, caminos expandibles, modal, hover mayor a 2 px o 1,02, tematizado exigido, CTA como enlace real). Las reglas del anexo v2.3 que no vi quedan pendientes.
- `check:nojs` OK en 10 verificaciones. Lighthouse móvil: perf 91 a 95, LCP 2,49 s, CLS 0, A11y 100 (igual que el commit anterior).
- Primer toque con CPU 4x y red de 1,6 Mbps / 150 ms (emulado, 7 corridas): hidratado 208 ms toque a panel pintado (retraso de entrada 53 ms, evento 64 ms). Toque 2 s después de ver el CTA: 2,1 s. Toque apenas visible: 2,8 s. No medí un móvil real.
