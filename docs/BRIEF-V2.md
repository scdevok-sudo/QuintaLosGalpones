# Brief v2 para Claude Code: Dirección visual y conversión (Quinta Los Galpones)

Fecha: 13/11/2026. Este documento **reemplaza la sección 5 del brief de Fase 1** y **ajusta** las secciones 3.1 (Inicio), 6.1 (slots) y 7 (formulario). Todo lo demás del brief original sigue igual: reglas de contenido, rutas, stack, SEO, verificaciones, límites.

## 0. Por qué cambia

Santi revisó el Checkpoint 1 y lo rechazó: "muy básico, parece hecho con IA". Tiene razón. Diagnóstico de la captura de Inicio a 1920 px:

1. **Paleta y tipografía de manual.** Crema + verde bosque + serif (Fraunces) + botón píldora + subrayado es la combinación por defecto de cualquier sitio generado. La prescribió el brief original; se descarta completa.
2. **Hero genérico.** Foto con velo oscuro uniforme (queda "barrosa"), H1 serif grande a la izquierda, párrafo, botón píldora y enlace subrayado. Es la composición más repetida que existe.
3. **Bug:** el nombre de marca del header pisa el ítem "Inicio" del menú.
4. **Vacío bajo el hero:** un bloque crema alto con el título de la sección apenas visible (estado inicial de un reveal).
5. **Nada propio de este lugar.** Podría ser cualquier quinta, hotel o consultora. El sitio no transmite lo que vende: un parque que pasa del día a la noche con luces, bajo techo de madera.

Las fotos provisorias de 1024 px son un problema aparte (Fase 2); no tocar.

## 1. Lo que dice la investigación (sitios de venues que convierten)

Fuentes: artículos de agencias especializadas en venues (varias son marketing propio, tomar como patrones y no como cifras).

- **La primera pantalla responde preguntas de compra:** qué es, dónde, para cuántos, cuál es el siguiente paso. Un titular emotivo sin datos pierde contra uno con datos.
- **Datos de decisión rápida cerca del inicio:** capacidad, ubicación, interior/exterior, estacionamiento, catering, plan B de lluvia. En mobile, todo eso más un CTA y un contacto tienen que verse en la primera pantalla.
- **Prueba visual con eventos reales**, no salones vacíos ni sesiones producidas. Galería agrupada por evento, con pie de foto útil (cantidad de invitados, época del año, sector usado).
- **El plan B de lluvia mostrado con imágenes** es una de las dudas que más frena la decisión.
- **Un CTA con verbo del cliente** ("Consultar por mi fecha", "Coordinar una visita"), repetido y siempre a mano; nunca "Enviar".
- **Formulario corto:** fecha (con "todavía no sé"), invitados en rangos, tipo de evento, contacto. Lo largo viene después de la visita. Indicar qué pasa después.
- **Precio:** mostrar una forma (un "desde", un rango o al menos qué variables lo definen) filtra mejor que ocultarlo del todo.
- **Mobile:** nada de video de fondo ni galerías pesadas; si no entiende el lugar y el siguiente paso en un scroll, el diseño es demasiado decorativo.
- **Lo que distingue a los sitios memorables de una plantilla:** identidad sacada del propio lugar (materiales, paisaje, paleta del lugar), tipografía con jerarquía clara, espacio en blanco intencional, composiciones que rompen la grilla con criterio, contenido real, y scroll narrativo lento. 3D, distorsión de cursor y tipografía experimental quedan para marcas de arte o música: **descartados** acá.

## 2. Concepto: "De día a noche"

Lo más característico de Los Galpones es **la luz**: un parque a pleno sol que se vuelve fiesta bajo techo de madera con luces. Eso es lo que el sitio tiene que hacer sentir.

- **Una sola idea grande (momento firma):** en Inicio, un recorrido "Un día en Los Galpones" (sección 6) donde, al hacer scroll, la escena pasa de tarde de parque a noche iluminada. El resto del sitio se mantiene sobrio.
- **Sistema día/noche:** las secciones son "día" (superficie clara) o "noche" (superficie oscura). Después del recorrido, Inicio queda en "noche" hasta el pie. Las páginas internas son "día" con un cierre "noche" (CTA + pie).
- **Un motivo de forma, discreto:** la silueta de **galpón** (frontón a dos aguas) como máscara de algunas fotos clave. Es específico del lugar y barato (`clip-path`).

## 3. Sistema visual

**Color (nombres propios del lugar; ajustar con criterio mirando capturas):**

| Token | Valor | Uso |
|---|---|---|
| `tarde` | `#E9E6D2` | superficie "día" (pasto seco, no crema) |
| `tinta` | `#231B13` | texto sobre día, botón primario en día |
| `noche` | `#151D18` | superficie "noche" (verde casi negro de arboleda) |
| `lamparita` | `#FFB347` | acento cálido: foco, subrayados, brillos decorativos y botón primario sobre noche |
| `madera` | `#8A5A36` | detalles puntuales y texto grande sobre día |
| `eucalipto` | `#6F836F` | secundario decorativo o texto grande (no pasa AA como texto chico sobre `tarde`) |

Reglas: texto principal siempre `tinta` sobre día y `tarde` sobre noche. Botón primario: `tinta` con texto `tarde` en día; `lamparita` con texto `noche` en noche. Sin gradientes decorativos tipo "wash"; el único degradé permitido es el tinte de hora dentro del recorrido (sección 6). Sin sombras grises genéricas.

**Tipografía (dos familias claramente distintas):**
- Títulos: **Bricolage Grotesque** (`@fontsource-variable/bricolage-grotesque`). Grotesca con carácter, algo de cartelería de campo. H1 grande, tracking apretado, `opsz` alto.
- Cuerpo: **Newsreader** (`@fontsource-variable/newsreader`), 18 px en mobile, interlineado ≥ 1.65, ancho ≤ 65ch (serif admite algo más de interlineado).
- Cargar solo los ejes que se usan, `font-display: swap`, preload de la fuente del H1.
- Escala tipográfica definida en tokens (no valores sueltos). El título es parte del diseño: tamaño y peso con intención, no un contenedor neutro.

**Alineación y layout:** texto alineado a la izquierda por defecto. Centrado solo en el cierre. Composición asimétrica: fotos de distintos tamaños, alguna que se superpone al bloque de texto o sale del contenedor; **nada de grillas de tarjetas idénticas**. Cada bloque tiene su propio radio y proporción según su jerarquía; los botones no son píldoras por defecto (usar radio chico, 6 a 10 px).

**Máscara de galpón:** `clip-path: polygon(0 var(--roof), 50% 0, 100% var(--roof), 100% 100%, 0 100%)` con `--roof: clamp(32px, 7vw, 88px)`. Usarla en 3 lugares como máximo: foto del hero, foto de "espacio cubierto" y foto de lluvia (el techo es el tema).

## 4. Lista negra (marcas de página generada) y `check:tells`

No usar, salvo que el contenido lo pida:
- Fondo crema con serif de alto contraste y acento terracota; negro puro con un único acento ácido.
- Etiquetas pequeñas en MAYÚSCULAS con tracking arriba de cada título (eyebrows).
- Cadenas de metadatos con puntos medios ("A · B · C"), etiquetas "PALABRA — fragmento", flechas "→" al final de enlaces o botones, fuente monoespaciada para etiquetas.
- Resaltar una sola palabra del título con otro color o cursiva.
- Numerar bloques (01/02/03). Solo numerar si es una **secuencia real** (el "Cómo seguimos" de la sección 5 sí lo es).
- Tarjetas idénticas con el mismo radio y sombra suave; cifras gigantes con rótulo chico como recurso de hero.
- Reveal "fade + subir 16 px" en cada sección, hover animado en cada tarjeta, glassmorphism, 3D, parallax pesado, Lenis, GSAP.
- Negro tintado `#0B0B0B`/`#111` como reemplazo del negro.

Crear `npm run check:tells`: falla si en `src/` aparecen `uppercase`, `tracking-widest`, `font-mono`, el carácter `→`, ` · ` dentro de textos, `—` en copy visible, o clases de sombra genéricas (`shadow-md`, `shadow-lg`). Correrlo junto con `check:content`.

## 5. Inicio v2 (orden y composición)

Orden, pensado para conversión: primero lo que decide, después la prueba, después el cierre.

1. **Hero**
2. **Ficha del lugar** (datos de decisión)
3. **Un día en Los Galpones** (momento firma, sección 6)
4. **Dos caminos:** Casamientos y Eventos de empresa
5. **¿Y si llueve?** con interruptor Sol/Lluvia
6. **Reseñas y testimonios** (noche)
7. **Cómo seguimos** (secuencia real de 3 pasos, noche)
8. **Consulta express + cómo llegar + mapa** (noche) y pie

**Hero (desktop y mobile):** sin velo oscuro sobre la foto. El texto **no va encima de la foto**: así el contraste está garantizado y la foto se ve limpia.

```
Desktop (1280+)                          Mobile (390)
+--------------------------------+       +--------------------+
| marca            menu  [Visita]|       | marca        [menu]|
|                                |       +--------------------+
| Casamientos y     /\___________|       |   /\______________ |
| eventos en una   /  foto en    |       |  /   foto con      ||
| quinta de       |  galpon, a   |       | |    gente (galpon)||
| Benavidez       |  sangre al   |       | |__________________||
|                 |  borde       |       | Casamientos y      |
| Bajada (copy)   |   +--------+ |       | eventos en una     |
| [Boton] enlace  |   | foto 2 | |       | quinta de Benavidez|
| 6.000 m2...     |___+--------+_|       | Bajada, [Boton]    |
+--------------------------------+       | datos en una frase |
                                         +--------------------+
```

- H1, bajada, botón y enlace secundario: copy del documento. El botón primario abre la **consulta express** (sección 7) y, sin JS, enlaza a `/contacto/#formulario`.
- Debajo del botón, una sola frase en texto corriente con los datos del copy: "6.000 m² de parque, 320 m² cubiertos y a 500 metros de Panamericana." No usar cifras gigantes con rótulos.
- Foto 1 con máscara de galpón, a sangre en el borde derecho. Foto 2, más chica, superpuesta (gente, plano más cerrado). En mobile, una sola foto arriba, con `aspect-ratio` reservado y la foto LCP con `fetchpriority="high"`.
- Sin estado `opacity: 0` inicial. Sin animación de entrada en el hero.

**Ficha del lugar:** lista de definición de dos columnas, sin reglas ni tarjetas: Parque, Espacio cubierto, Ceremonia, Servicios, Estacionamiento, Llegada. Todo con datos que ya están en el copy; nada que no esté confirmado (ver reglas 2.3).

**Dos caminos:** Casamientos es el bloque grande (foto con máscara de galpón); Eventos de empresa es más chico y distinto de proporción. No son dos tarjetas iguales.

**Cómo seguimos (secuencia real, numerada):** 1) Contanos tu evento, 2) Visitás la quinta, 3) Recibís la propuesta por escrito. Se apoya en el copy existente ("Con esa información podemos enviarte una propuesta y coordinar una visita"). Cualquier frase nueva va a `COPY-CAMBIOS.md`. No prometer plazos de respuesta.

## 6. Momento firma: "Un día en Los Galpones"

Escenario fijo (`position: sticky`, 100 svh) dentro de un contenedor alto (~400 vh desktop, ~320 vh mobile). Al hacer scroll avanzan 4 escenas con crossfade de foto, cambio de texto y de luz.

| Escena | Contenido (copy del documento) | Foto (slot) |
|---|---|---|
| Llegada | llegada por el parque, 500 m de Panamericana, calle asfaltada, estacionamiento dentro del predio | `story.llegada` |
| Ceremonia | espacio para la ceremonia, parque, ceremonia entre árboles | `story.ceremonia` |
| Fiesta | fiesta que sigue en el espacio cubierto, 320 m² ampliables a 520 | `story.fiesta` |
| Noche | sonido e iluminación propios | `story.noche` |

- **Luz:** una variable `--hora` (0 a 1) mueve un tinte sobre la foto (`mix-blend-mode`): sin tinte, luz dorada de tarde, azul verdoso de noche. En la escena Noche suman unos brillos `lamparita` **decorativos** (radiales, `aria-hidden`) en el borde del encuadre. Implementar con CSS scroll-driven (`animation-timeline: scroll()` / `view()`) y, como respaldo, `IntersectionObserver` que cambia la escena por pasos.
- **Texto legible en todo momento:** el texto vive en un panel con superficie propia (`tarde` en escenas de día, `noche` en las nocturnas) que cambia en el límite entre escenas. **No interpolar el color del texto sobre un fondo que cambia de forma continua.** Muestrear el contraste en 0, 25, 50, 75 y 100 % y registrarlo en el informe.
- **Riel de progreso** con los 4 nombres (Llegada, Ceremonia, Fiesta, Noche) como botones accesibles que saltan a cada escena. Marcar la escena actual con `aria-current`.
- **Cada escena enlaza** a la página correspondiente con el verbo del cliente ("Conocé los espacios", "Quiero organizar mi casamiento").
- **`prefers-reduced-motion`, sin JS e impresión:** las 4 escenas se muestran como 4 bloques apilados normales, cada uno con su foto y su superficie día/noche. Nada de sticky.
- **Rendimiento:** 4 fotos en AVIF/WebP, carga diferida salvo la primera, solo `transform` y `opacity` animados. Si en mobile gama media se traba, bajar a escenas por pasos sin tinte continuo.
- Si el tiempo aprieta, versión mínima aceptable: 4 escenas con crossfade por `IntersectionObserver` y tinte por clase.

## 7. Interacciones de conversión

**7.1 Consulta express (panel inferior en mobile, modal en desktop):** reemplaza al botón flotante de WhatsApp.
- Paso 1 (3 campos, sin datos personales): Tipo (Casamiento, Evento de empresa, Otro), Fecha (selector + casilla "Todavía no tengo fecha"), Invitados por rangos (hasta 100, de 100 a 200, más de 200, todavía no sé). Los rangos son solo opciones de formulario; **no son una afirmación de capacidad**. Confirmarlos con el cliente.
- Paso 2: dos salidas. "Seguir por WhatsApp" abre el chat con el mensaje del documento **ya completado** con lo elegido. "Prefiero que me escriban" pide nombre y un medio de contacto (correo o WhatsApp) y envía al endpoint del formulario.
- Barra fija inferior en mobile con el botón "Consultar por mi fecha" (texto del documento). Sin burbuja flotante tapando contenido; la barra reserva su espacio con `padding-bottom` y se oculta con el teclado abierto.
- Estados de éxito y error con los textos del documento. Eventos GA4: panel abierto, paso 2, salida elegida, envío.
- Foco atrapado, `Esc` cierra, labels reales, accesible por teclado. `<dialog>` nativo.

**7.2 Interruptor Sol / Lluvia en "¿Y si llueve?":** control segmentado de 2 opciones que cambia la escena (parque a pleno sol ↔ armado cubierto) con un crossfade corto y el pie de foto correspondiente. Es una interacción del usuario, así que el movimiento está justificado. Sin partículas de lluvia. Slots: `lluvia.sol`, `lluvia.cubierto`. Si no hay foto real de armado cubierto, no mostrar el interruptor: dejar el texto y marcar el pendiente.

**7.3 Respuesta automática al contacto (Apps Script):** además del mail al cliente, enviar un mail corto a quien consultó, con el texto de confirmación del documento y el resumen de lo que cargó. **Sin promesa de plazo de respuesta.** Remitente "Quinta Los Galpones" y `replyTo` al correo del cliente (pendiente de validar).

**7.4 Precio:** preparar un bloque opcional "Cómo se arma tu presupuesto" que explique las variables (fecha, cantidad de invitados, servicios) a partir de la frase del documento ("Al pedir presupuesto vas a recibir el detalle…"). Si el cliente aprueba publicar un "desde" o un rango, queda en `site.ts` con `validated`. Hasta entonces no se muestra ninguna cifra.

## 8. Motion permitido y prohibido

Permitido (en este orden de prioridad):
1. El recorrido "Un día en Los Galpones" (el único movimiento no pedido por el usuario).
2. Interacciones que responden a una acción: consulta express, interruptor Sol/Lluvia, acordeón de FAQ, lightbox, menú mobile.
3. Transición suave entre páginas con View Transitions de React Router (`viewTransition`).

Prohibido: reveals genéricos en cada sección, hover animado en cada tarjeta, entrada animada del hero, cursor magnético, parallax. Todo respeta `prefers-reduced-motion`. Solo `transform` y `opacity`.

## 9. Páginas internas

Casamientos, Eventos de empresa, Espacios, Eventos reales, FAQ y Contacto usan el mismo sistema, en versión sobria:
- Cabecera de página en "día": H1 grande, bajada y UN botón; una foto con máscara de galpón solo si aporta (Espacios, Casamientos).
- Cierre en "noche" con la consulta express y el pie.
- **Eventos reales:** galería agrupada por evento, con pie de foto útil solo con datos aprobados (invitados, época, sector). Lightbox con `<dialog>`.
- **FAQ:** acordeón `<details>` con jerarquía tipográfica clara, sin tarjetas.
- Cada página tiene su propia composición: no repetir el mismo esqueleto "título + párrafo + tarjetas".

## 10. Qué rehacer del Checkpoint 1

1. Reemplazar tokens, fuentes y layout por lo de este documento. Quitar Fraunces y DM Sans.
2. Arreglar el header: marca (isotipo de árbol + "Los Galpones") sin pisar el menú a 360, 390, 768, 1280 y 1920 px; menú de 7 ítems y botón "Coordinar una visita". Un solo `<nav>`.
3. Quitar el velo oscuro del hero y todo reveal con estado inicial oculto. Revisar el espacio vacío bajo el hero.
4. Rehacer Inicio con el orden de la sección 5, sin tarjetas idénticas.
5. Mantener lo que está bien: prerender, SEO, contenido tipado, `check:*`, sistema de slots, mapa con fachada de clic.
6. `check:content` y `check:tells` en verde.

## 11. Slots nuevos y pendientes del cliente

Slots: `story.llegada`, `story.ceremonia`, `story.fiesta`, `story.noche`, `lluvia.sol`, `lluvia.cubierto`, `hero.principal`, `hero.secundaria`. Para el recorrido conviene que `story.fiesta` y `story.noche` muestren las luces del espacio cubierto.

Preguntas para Iván (agregar al Anexo del informe): ¿publican un "desde" o un rango de precios? ¿Hay fotos del armado cubierto con lluvia o con el mismo evento de día? ¿Pueden pasar la cantidad de invitados y la época de 4 o 5 eventos reales para los pies de foto? ¿Quién responde las consultas y en cuánto tiempo real? (No se publica ningún plazo hasta que lo definan.) Opcional a futuro: calendario de fechas disponibles alimentado desde una planilla de Google.

## 12. Criterios de aceptación v2 y Checkpoint 2

1. Capturas en 390, 768 y 1280/1920 px de Inicio y de una página interna (Casamientos). Ningún texto sobre foto sin superficie propia; sin solapamientos en el header.
2. Contraste AA medido en el recorrido (0, 25, 50, 75, 100 %) y en ambos temas.
3. Lighthouse mobile en Inicio: Performance ≥ 85 con el recorrido activo (con las fotos provisorias), Accesibilidad ≥ 95. Si el recorrido baja de 85, simplificar según la sección 6.
4. `check:content`, `check:tells` y `check:links` (cuando existan las demás páginas) en verde.
5. **Checkpoint 2 (pausar):** mostrar capturas de Inicio completo (mobile y desktop) y un video corto o secuencia de capturas del recorrido de 4 escenas. Listar decisiones tomadas y qué se simplificó. No seguir con las demás páginas hasta recibir OK de Santi.
