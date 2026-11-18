# Crítica del checkpoint 5 (método impeccable)

Modo: **Persuadir**. Evidencia: capturas y videos de esta carpeta, `check:tells`, `check:nojs`, `measure:tap`, Lighthouse móvil.
Límite de esta entrega: el anexo v2.3 no está en `docs/` (ni en ningún lado de la PC), así que no apliqué el oficio de interacción global, el cierre nocturno con lamparitas, las reglas restantes de `check:tells` ni los límites tipográficos.

## Veredicto de especificidad
Sigue siendo específico del lugar (paleta del predio, recorrido de día a noche, techo del hero). El panel nuevo no tiene nada de plantilla: es un popover nativo que se anuncia solo con el color de la superficie.

## Fortalezas
1. **El primer toque ya no depende de React.** El panel está en el HTML y se abre con `popovertarget`: con CPU 4x y 1,6 Mbps pinta en 211 ms de mediana (máximo 265 ms) tocando antes de hidratar, 158 ms 2 s después y 174 ms hidratado.
2. **Sin JS sirve igual.** El panel ofrece WhatsApp con el mensaje genérico y Cerrar funciona (`sinjs-mobile-*.png`).
3. **Cierre limpio.** Mapa, dirección en una línea y un único botón. Se acabó la repetición de la visita que marcó la crítica anterior.

## Problemas prioritarios
1. **El panel mobile en pantallas bajas se pasa de un tercio de contenido.** El tope es 33 svh y se respeta (33,1 % a 390x844), pero a 360x740 y 375x667 el paso 1 scrollea por dentro. Si querés que entre completo en todo teléfono, el título pasa a una línea o "Seguir" se une al selector.
2. **El clic afuera cierra el panel** (`popover="auto"`). Es nativo y evita un panel olvidado, pero alguien que completa la fecha y toca la página pierde la vista (no los datos). Si molesta, pasar a `popover="manual"` y cerrar solo con Cerrar y Esc propio.
3. **El mapa embebido pesa más que la fachada anterior.** Es `loading="lazy"` y Lighthouse no se movió (LCP 2,49 s, perf 95), pero carga cookies de Google cuando se acerca. Si el cliente prefiere privacidad, volver a fachada con el botón (que ya no sería único).
4. **Testimonios ocultos mientras no haya 3 aprobados.** Hoy hay 2 con `approved: false`, así que Inicio no tiene prueba social. Es lo correcto, pero hay que pedir autorizaciones.
5. **El menú y los CTA a `/contacto/` apuntan a páginas que todavía no existen.** Los CTA ya no (van a WhatsApp o al panel), el menú sí.

## Observaciones menores
- El selector de tipo ya no muestra el círculo del radio; el relleno marca la opción. Revisar con lector de pantalla real.
- La entrada del hero y el recorrido siguen siendo los dos únicos momentos autorados.
- Detecté y arreglé el menú sin JS en mobile, que se superponía al hero.
