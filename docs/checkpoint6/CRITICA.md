# Crítica del checkpoint 6 (método impeccable)

Modo: **Persuadir**. Alcance: anexo v2.3 completo (oficio de interacción, cierre nocturno, tipografía, reglas de `check:tells`) y la página de Casamientos con ese lenguaje. Evidencia: videos y capturas de esta carpeta, `check`, `check:nojs`, Lighthouse móvil (Inicio perf 95 / LCP 2,49 s; Casamientos perf 95 / LCP 2,94 s; CLS 0 y A11y 100 en ambas).

## Veredicto de especificidad
Casamientos no se parece a ninguna plantilla de salón: cabecera con el H1 grande a la izquierda y la bajada a la derecha, una foto ancha como protagonista, secciones asimétricas (la foto cambia de lado y de tamaño en cada una) y un cierre con la guirnalda de las lamparitas. La foto del hero comparte el cuadro con la card de Inicio (transición entre páginas).

## Fortalezas
1. **Una sola voz de interacción.** Tres curvas, press de 0,97 en 160 ms en todo lo clickeable, hover solo con puntero fino, panel que entra en 200 ms y sale en 100 ms, y Esc o Enter sin animar. Reduced motion conserva fades y colores y saca el movimiento.
2. **El cierre nocturno funciona como momento.** La guirnalda se prende una vez al entrar (0, 4, 8, 10 lamparitas a 400, 800 y 1500 ms; al volver no se repite) y el CTA queda debajo. Sin JS y con reduced motion ya viene prendida.
3. **Las reglas se prueban solas.** `test:tells` rompe cada regla a propósito (transition: all, scale(0), ease-in, hover fuera de la media query, carruseles, captions, halos sin offset, texto con gradiente, tracking) y verifica que los comentarios y los casos válidos pasen.

## Problemas prioritarios
1. **Inicio usa 10 fotos distintas; la meta es de 12 a 20 reales sin repetir.** Depende de la Fase 2 (hoy son provisorias del sitio actual). `check:launch` lo avisa.
2. **Casamientos repite el mismo tipo de bloque cuatro veces** (H2, párrafo, foto). El ritmo lo dan la asimetría y el cambio a noche en la lluvia, pero no hay un segundo momento autorado entre la cabecera y el cierre. Con las fotos finales conviene que la sección del parque rompa la grilla (foto que sale del contenedor).
3. **Casamientos y Inicio comparten la misma foto de hero** (p09), y en la página de Casamientos no hay prueba social. Dependen de fotos reales y de testimonios aprobados.
4. **Pendientes que rompen enlaces:** `/contacto/`, `/espacios/`, `/eventos-empresariales/`, `/eventos-reales/`, `/preguntas-frecuentes/` y `/politica-de-privacidad/` todavía no existen (30 enlaces en `check:links`, ninguno es un CTA).
5. **Panel mobile en pantallas bajas:** el paso 1 scrollea por dentro por debajo de 740 px de alto (tope de un tercio).

## Observaciones menores
- Descubrí que `/404/` y `/casamientos/` salían del prerenderizado como una cáscara vacía (la ruta con barra final no coincidía); ahora se prerenderizan completas y Casamientos pasó de perf 79 a 95.
- Los créditos de fotos irían en el footer; no hay datos de autoría todavía, así que no inventé ninguno.
- La fotografía del parque tiene un borde oscuro a la derecha en el archivo provisorio.
