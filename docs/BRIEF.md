# Brief para Claude Code: Nuevo sitio de Quinta Los Galpones (Fase 1: estructura y rediseño)

Fecha: 12/11/2026. Cliente: Quinta Los Galpones (Benavídez, Buenos Aires). Desarrolla: SCdev (Santi Cáceres).
Sitio actual: quintalosgalpones.com (WordPress + Elementor, una sola página). Anticipo abonado, se arranca.

## 0. Objetivo y fases

Construir el sitio nuevo de una quinta de eventos (casamientos y eventos de empresa) que hoy muestra bien el lugar pero no convierte: no hay formulario, ni WhatsApp visible, ni páginas por tipo de evento, ni FAQ, ni SEO local. El activo más fuerte del cliente son sus fotos y su lugar; el diseño tiene que dejarlas respirar y llevar al visitante a una consulta (WhatsApp o formulario) o a coordinar una visita.

- **Fase 1 (este brief):** estructura, diseño, contenido, formulario, SEO técnico y sistema de fotos con imágenes **provisorias**. El sitio queda completo y navegable en una URL de preview con `noindex`.
- **Fase 2 (sección 6, NO ejecutar todavía):** curación y optimización de las fotos finales desde una carpeta de Drive con muchas fotos. Se hace cuando Santi lo pida.

Mobile primero: la mayoría de las consultas de un salón de eventos llegan desde Instagram y WhatsApp en el celular. Se diseña y se aprueba en 390px; desktop es la adaptación.

## 1. Inputs

| Archivo | Qué es |
|---|---|
| `docs/Textos_nueva_web_Los_Galpones.md` | Copy del cliente: 7 páginas, títulos y descripciones SEO, rutas sugeridas, textos comunes y pendientes. **Fuente única del contenido.** |
| Sitio actual | Solo para tomar logo y fotos provisorias (son del cliente). No copiar su estructura ni sus textos. |

Datos del cliente que ya se conocen: Quintino Bocayuva 655, Benavídez, provincia de Buenos Aires; a 500 m de Panamericana; Instagram https://www.instagram.com/quintalosgalpones/ ; WhatsApp 11 5249-8834 (titular pendiente de confirmar).

Leer completo el archivo de textos antes de escribir código y hacer un resumen de 10 líneas con lo que entendiste y las dudas.

## 2. Reglas de contenido (críticas)

### 2.1 El copy se respeta tal cual
- Pasar el contenido a archivos tipados en `src/content/` (uno por página + `common.ts`), a mano, sin parsear en runtime.
- **No reescribir ni "mejorar" el copy.** Solo corregir erratas evidentes (ej. la coma sobrante en "6.000 m², y propuestas") y listarlas en el informe.
- Los prefijos "Botón", "H1", "Título SEO", "Descripción SEO", "Ruta sugerida" son etiquetas del documento, no texto publicable.
- Las atribuciones de los testimonios se muestran como `<cite>` sin guion largo.
- Todo texto que escribas vos (microcopy, alt, errores, política de privacidad): voseo rioplatense, tono cálido y cercano, nada corporativo, **sin guiones largos (—) para conectar ideas**, usar conectores reales.
- Todo copy que no sea verbatim del documento se lista en `docs/COPY-CAMBIOS.md` (qué, dónde, por qué) para que lo apruebe el cliente.

### 2.2 Notas internas del documento que NO se publican
El documento mezcla copy con indicaciones editoriales. Estas frases (o partes de frase) son notas y no deben aparecer en el sitio:

| Dónde | Nota a eliminar o reescribir |
|---|---|
| Inicio, testimonios | "Seleccionar fotografías del evento correspondiente, enlazar al testimonio original… confirmar autorización…" |
| Espacios, El parque | "Las fotografías de esta sección deben mostrarlo con gente y montajes reales…" |
| Eventos reales, Casamientos | Dejar solo "Ceremonias, recepciones y fiestas con distintos armados." (el resto es política interna, anotarlo en el informe como ambiguo) |
| Eventos reales, Eventos de empresa | Toda la sección está **oculta** (`visible: false`, fuera de navegación y de filtros) hasta tener ejemplos reales. Al activarla se publica solo la primera oración. |
| Eventos reales, clima | Es una nota. Escribir una línea pública breve y neutral (ej. "Mirá cómo se vive la celebración bajo techo cuando llueve.") y registrarla en `COPY-CAMBIOS.md`. |
| FAQ, estacionamiento | Publicar únicamente: "Sí, hay estacionamiento dentro del predio. Confirmamos la disponibilidad según el evento." **No** publicar la cifra de 200 vehículos ni la frase "base de información". |
| Contacto, Para llegar | "Agregar enlace al perfil oficial de Google Maps y una foto de la entrada." es una instrucción: implementarla, no mostrarla. |
| Formulario | "Para empresas, sumar nombre de la organización…" y "Mantener opcionales…" son instrucciones de implementación. |
| Pie de página | "Agregar teléfono, correo y enlace a Maps luego de validarlos." es una instrucción (ver 2.3). |
| Sección "Textos comunes" | Navegación, pie y WhatsApp son especificación. "Piezas visuales que faltan" y "Definiciones pendientes de Iván" son internas. |

### 2.3 Datos sin confirmar (no inventar, no afirmar)
Centralizar en `src/config/site.ts`, cada dato con `validated: boolean`. Si no está validado, no se muestra y entra en el reporte de pendientes.

- Teléfono/WhatsApp (titular y enlace), correo (hoy hay una cuenta de Hotmail: el cliente va a pasar uno con dominio propio), enlace al perfil de Google Maps, ID de Google Analytics, coordenadas.
- **No afirmar** "all inclusive", ni capacidad de 350 personas, ni 350 sentados, ni 200 vehículos, ni el contenido exacto de paquetes, ni la disponibilidad de la ampliación a 520 m² más allá de lo que dice el copy ("posibilidad de ampliar").
- **No mencionar** "José Michelini" ni actividades outdoor más allá de lo que ya dice el copy de Eventos de empresa.
- **No prometer** respuesta inmediata ni tiempos de respuesta: no está definido quién atiende los leads. Usar solo la confirmación del documento ("Recibimos tu mensaje. Te vamos a responder por el medio que indicaste.").

## 3. Arquitectura del sitio

Rutas (cada una con trailing slash y su título/descripción SEO del documento):

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/casamientos/` | Casamientos |
| `/eventos-empresariales/` | Eventos de empresa |
| `/espacios/` | Espacios |
| `/eventos-reales/` | Eventos reales |
| `/preguntas-frecuentes/` | Preguntas frecuentes |
| `/contacto/` | Contacto |
| `/politica-de-privacidad/` | Política de privacidad (borrador, ver 7.4) |
| `*` | 404 con enlaces a las páginas principales |

**Navegación:** Inicio · Casamientos · Eventos de empresa · Espacios · Eventos reales · Preguntas frecuentes · Contacto, más acción destacada "Coordinar una visita" (→ `/contacto/#visita`). En mobile, menú a pantalla completa. Un solo `<nav>` en el DOM.

**WhatsApp en mobile:** botón flotante compacto (≥ 48px, con `safe-area-inset`), que se oculta cuando el formulario o el bloque de contacto están en pantalla, y con `padding-bottom` extra para no tapar el contenido ni el pie.

### 3.1 Secciones por página (todas desde el documento, en ese orden)
- **Inicio:** hero (H1 + bajada + botón + enlace secundario) · "Un lugar con espacio para vivir cada momento" (mostrar 6.000 m² de parque, 320 m² cubiertos, ampliable a 520 m², a 500 m de Panamericana, como cifras destacadas con el copy hedged) · Casamientos · Eventos de empresa · "¿Y si llueve?" · "Lo que cuentan quienes celebraron acá" + reseñas de Google (sección 9) · "Vení a verlo con tu evento en mente" (dirección, mapa, CTA).
- **Casamientos:** hero · Una ceremonia en la quinta · El parque y los galpones · Una propuesta con los servicios claros · Si el pronóstico anuncia lluvia (`id="lluvia"`) · Cómo pedir una propuesta (`id="propuesta"`).
- **Eventos de empresa:** hero · Qué tipo de encuentro imaginás · Un lugar para distintos momentos · Operación y servicios · La alternativa por lluvia también forma parte del proyecto · Contanos lo esencial (`id="propuesta"`).
- **Espacios:** hero · El parque · El espacio cubierto · La ceremonia · Llegada y servicios · CTA agendar visita.
- **Eventos reales:** hero · filtro por tipo (Casamientos, Clima/lluvia; Eventos de empresa oculto) · galería por historias con lightbox.
- **Preguntas frecuentes:** acordeón con `<details>` nativo (accesible y funciona sin JS), 10 preguntas del documento.
- **Contacto:** hero con dos botones · bloque `id="visita"` · formulario `id="formulario"` · Para llegar (dirección, "Cómo llegar", mapa, foto de la entrada).

### 3.2 Destino de cada botón
Los textos son los del documento. Los destinos los decidí yo; si alguno te parece mal, pausá y preguntá.

| Botón (página) | Destino |
|---|---|
| Vení a conocer la quinta (Inicio) | `/contacto/#visita` |
| Contanos qué evento querés organizar (Inicio, enlace secundario) | `/contacto/#formulario` |
| Conocé los espacios (Inicio) | `/espacios/` |
| Quiero organizar mi casamiento (Inicio) | `/casamientos/` |
| Consultar por un evento de empresa (Inicio) | `/eventos-empresariales/` |
| Ver cómo pensamos el plan de lluvia (Inicio) | `/casamientos/#lluvia` |
| Consultar por mi fecha (Casamientos, hero) | `#propuesta` de la misma página |
| Consultá el plan de lluvia para tu casamiento | WhatsApp con mensaje de casamiento + lluvia |
| Pedir presupuesto por WhatsApp (Casamientos) | WhatsApp con mensaje de casamiento |
| Consultar por un evento de empresa (Empresas, hero) | `#propuesta` de la misma página |
| Pedir una propuesta para mi empresa | `/contacto/?tipo=empresa#formulario` (preselecciona el tipo) |
| Agendar una visita (Espacios) | `/contacto/#visita` |
| Consultar por un evento como este (Eventos reales) | `/contacto/#formulario` |
| Escribir por WhatsApp (Contacto) | WhatsApp genérico |
| Coordinar una visita (Contacto y menú) | `#visita` y WhatsApp con mensaje de visita |

Mensaje base de WhatsApp (del documento): "Hola, quiero consultar por [casamiento / evento de empresa] en Quinta Los Galpones. Pensamos en [fecha] para unas [cantidad] personas. ¿Podemos conversar sobre las opciones y coordinar una visita?" Generar variantes por contexto dejando los corchetes literales para que la persona los complete. Un único helper `whatsappLink(context)` en `src/lib/`.

## 4. Stack y requisitos técnicos

- React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router 7. Sin Three.js, sin GSAP, sin Lenis: no hacen falta y pesan.
- **SEO real, no solo client-side:** pre-renderizar cada ruta a HTML estático con su `<title>`, meta description, canonical, Open Graph y JSON-LD ya dentro del HTML. Usar React Router 7 en modo framework con `prerender` o `vite-react-ssg`, lo que resulte más simple de mantener. Requisito de salida: cada ruta queda como `dist/<ruta>/index.html`, para servirse con cualquier servidor estático sin reglas de rewrite (el destino probable es OpenLiteSpeed detrás de Cloudflare). Si la herramienta genera `casamientos.html`, post-procesar.
- Fuentes autoalojadas con `@fontsource-variable` (Fraunces para títulos, DM Sans para cuerpo), `font-display: swap`, preload de la fuente del LCP.
- Variables de entorno: `VITE_SITE_URL`, `VITE_NOINDEX` (true en preview: agrega `noindex` y `robots.txt` que bloquea), `VITE_FORM_ENDPOINT`, `VITE_GA_ID`. `.env.example` documentado.
- `.gitignore`: `node_modules`, `dist`, `.env*`, `drive-fotos/`, `.photos-review/`, y todo archivo con "claude" en el nombre.
- No subir nada a producción, no tocar DNS, WordPress ni el VPS. Preview en Vercel o `npm run preview` local, siempre con `noindex`.
- Presupuesto de rendimiento: JS inicial < 150 KB gzip, CLS ≈ 0 (toda imagen con `aspect-ratio` reservado), LCP con `fetchpriority="high"` y `<link rel="preload">`.

## 5. Dirección visual y motion

**Concepto:** "luz de atardecer en el parque". Natural, cálido y editorial; sencillez y elegancia (lo que dice el propio cliente), sin parecer una plantilla de salón de fiestas. Las fotos son las protagonistas. Es el polo "light, product-led" de la guía de diseño de SCdev, no el dark kinetic.

**Problemas del sitio actual a resolver (los vi en pantalla):**
- Foto de portada sobresaturada, con viñeta oscura y colores quemados; el título blanco cae sobre el traje y el vestido y se lee mal.
- Botón verde chillón que desentona con la paleta cálida de las fotos; menú blanco sobre follaje poco legible.
- Bloques blancos enormes con una sola frase, sin ritmo entre secciones.

**Tokens iniciales (ajustables, con criterio y dejando registro):**

| Token | Valor | Uso |
|---|---|---|
| `cream` | `#F7F2E9` | fondo base |
| `ink` | `#1F1B16` | texto |
| `forest` | `#23402F` | color de marca, botón primario (texto crema, contraste ~10:1) |
| `moss` | `#5C7A4E` | acentos secundarios |
| `timber` | `#6B4A2F` | detalles cálidos |
| `amber` | `#C98B2B` | solo decorativo o texto grande (no pasa AA sobre crema como texto chico) |

El verde se mantiene como color de marca (el cliente ya lo usa), pero más sobrio.

**Tipografía:** Fraunces (títulos, con carácter pero cálida) + DM Sans (cuerpo 17-18px, interlineado ~1.65, ancho de lectura ≤ 65ch). H1 con `clamp()`.

**Ritmo de página:** alternar bandas de foto a sangre completa, bloques de texto con aire medido, tarjetas con imagen y cifras destacadas. Nada de bloques vacíos. **Todo texto sobre foto lleva un scrim degradé** que garantice contraste AA; verificar con captura.

**Motion: máximo 3 patrones, con propósito, y todo desactivado con `prefers-reduced-motion`:**
1. Entrada del hero: la imagen escala suave (1.06 → 1) y el texto sube escalonado.
2. Reveals al hacer scroll (opacidad + 16px), una sola vez. Preferir CSS (`animation-timeline: view()` con fallback de `IntersectionObserver`). **El contenido tiene que verse sin JS y antes de hidratar** (nada de `opacity: 0` inicial que oculte el HTML pre-renderizado).
3. Transiciones entre páginas con View Transitions de React Router (`viewTransition` en los `<Link>`).

Motion (`motion/react`, con `LazyMotion`) solo para estados de UI: menú mobile, lightbox, tabs. Sin scroll-jacking, sin parallax pesado, sin video de fondo.

## 6. Fotos

### 6.1 Fase 1: sistema de slots con imágenes provisorias
- Componente `<Photo slot="home.hero" />` que lee `src/content/photos.ts`: por slot, `src` (y variantes), `alt`, punto focal `{x,y}` para `object-position`, relación de aspecto desktop y mobile (art direction con `<picture>`), `temp: boolean`.
- Para ver el diseño con material real, bajar del sitio actual unas 12-15 fotos como **provisorias** (son del cliente), marcadas `temp: true`. Si el HTML de Elementor no deja extraerlas, usar placeholders degradé con el nombre del slot.
- Modo dev `?slots=1` que superpone el nombre de cada slot sobre su imagen (excluido del build de producción). Sirve para elegir fotos en la Fase 2.
- Alt descriptivos en español rioplatense, nunca "imagen".

Slots mínimos: `home.hero`, `home.espacios`, `home.casamientos`, `home.empresas`, `home.lluvia`, `home.visita`, `casamientos.hero`, `casamientos.ceremonia`, `casamientos.parque`, `casamientos.interior`, `casamientos.servicios`, `casamientos.lluvia`, `empresas.hero`, `empresas.encuentro`, `empresas.espacios`, `empresas.servicios`, `espacios.hero`, `espacios.parque`, `espacios.cubierto`, `espacios.ceremonia`, `espacios.llegada`, `espacios.banos`, `reales.*` (galería, cada una con tipo de evento), `contacto.hero`, `contacto.entrada`, `og.default`, `equipo`.

### 6.2 Fase 2 (NO ejecutar hasta que Santi lo pida)
Santi baja el Drive a `./drive-fotos/` (no se commitea). Entonces:
1. `npm run photos:review`: genera hojas de contacto en `.photos-review/` (miniaturas con nombre de archivo, 6x4 por hoja) y un listado que marca duplicados, fotos < 1600 px de lado largo y orientación EXIF dudosa. Santi elige mirando las hojas.
2. Santi completa `photos.config.json` (slot → archivo, punto focal, alt, crédito si corresponde).
3. `npm run photos:build` con `sharp`: AVIF + WebP en 480/768/1200/1920 px, LQIP de 24 px, **eliminar todo EXIF incluido GPS**. Sin filtros agresivos: si hace falta unificar color (hoy hay fotos con tratamientos muy distintos), un ajuste suave y único para todas, comparando antes/después. Peso total de optimizadas < 15 MB; los originales no se commitean.
4. Las fotos de eventos reales y de personas llevan `approved: boolean` (autorización de quienes aparecen).

## 7. Formulario, analítica y legales

### 7.1 Formulario de consulta
Título "Pedí una propuesta para tu evento", ayuda, botón, confirmación y error: textos exactos del documento.
- Campos: Nombre · Correo · WhatsApp · Tipo de evento · Fecha estimada · Cantidad aproximada de personas · Mensaje. Si el tipo es empresa, aparece "Nombre de la organización". Fecha y cantidad opcionales.
- Validación: nombre obligatorio y **al menos un medio de contacto** (correo o WhatsApp), porque la confirmación promete responder "por el medio que indicaste". Tipo de evento: Casamiento, Evento de empresa, Otro evento social. Leer `?tipo=` de la URL.
- Backend liviano en Google Apps Script (`apps-script/Code.gs` en el repo, Santi lo despliega): `doPost` agrega una fila a una planilla y envía mail al cliente con `replyTo` del contacto. Correo destino configurable (hoy no está definido). POST con `Content-Type: text/plain` para evitar preflight.
- Antispam sin captcha: campo honeypot + tiempo mínimo de envío. Si falla el envío, mostrar el error del documento con enlace a WhatsApp.
- Accesible: labels reales, errores asociados con `aria-describedby`, foco al error, estado de envío anunciado.

### 7.2 Analítica
GA4 solo si existe `VITE_GA_ID`, cargado sin bloquear el render. Eventos: clic en WhatsApp (con contexto), envío exitoso del formulario, clic en "Coordinar una visita", clic en "Cómo llegar".

### 7.3 Pie de página
Texto del documento. Teléfono, correo y enlace a Maps aparecen solo cuando `validated: true`.

### 7.4 Política de privacidad
Página simple en borrador, que declare qué datos se piden, para qué, quién los trata, cómo ejercer derechos de acceso y rectificación (Ley 25.326 de Protección de Datos Personales) y cómo contactar. Marcar claramente en el informe que es un **borrador sin validación legal** y que el cliente debe revisarlo.

## 8. SEO técnico

- Título y descripción por ruta, tal cual el documento. Canonical a `https://quintalosgalpones.com/...` (confirmar si es con o sin www). `lang="es-AR"`. Open Graph y Twitter card con `og.default`.
- `sitemap.xml` y `robots.txt` generados en el build (respetando `VITE_NOINDEX`).
- JSON-LD: `LocalBusiness` (o `EventVenue`) con nombre, dirección, URL, `sameAs` (Instagram) y solo los datos validados; `FAQPage` en preguntas frecuentes; `BreadcrumbList`. **No agregar `aggregateRating` ni marcado de reseñas propias**: Google no las considera elegibles en LocalBusiness y no aportan.
- Un único `h1` por página, jerarquía de headings correcta, enlaces internos con texto descriptivo, imágenes con alt.

## 9. Reseñas de Google

El cliente pidió incluir reseñas positivas de Google. Se hace así en Fase 1:
- Componente `GoogleReviews` alimentado por `src/content/reviews.ts` (`author`, `rating`, `text`, `date`, `approved`). Se muestra en Inicio junto a los testimonios y, opcionalmente, en Casamientos.
- Encabezado "Reseñas en Google" + enlace "Ver todas las reseñas en Google" al perfil de Maps. **Si no hay URL del perfil validada, el bloque no se renderiza.** No mostrar puntaje promedio ni cantidad de reseñas salvo que sean datos reales que pase Santi.
- Las reseñas deben ser reales y copiadas por Santi del perfil, nunca inventadas ni reescritas. Sin scraping.
- Dejar el componente preparado para que más adelante se alimente de la Places API si el cliente lo quiere (fuera de alcance ahora).
- Los dos testimonios del documento (Daiana V., Antonella R.) van como "testimonios" con `approved` pendiente.

## 10. Verificación y criterios de aceptación

Después de cada bloque: `tsc --noEmit` y `npm run build`.

Scripts a crear y correr antes de entregar:
- `npm run check:content`: falla si en `dist/` aparece alguna de estas cadenas (ampliar la lista si hace falta): `Seleccionar fotografías`, `base de información`, `Definiciones pendientes`, `Piezas visuales`, `Ruta sugerida`, `Título SEO`, `Descripción SEO`, `Michelini`, `Hotmail`, `Agregar enlace`, `Publicar esta sección`, `Botón `, `200 vehículos`, `all inclusive`, `350`.
- `npm run check:links`: todos los enlaces internos y anclas (`#lluvia`, `#propuesta`, `#visita`, `#formulario`) resuelven.
- `npm run check:launch`: lista lo pendiente para publicar (fotos `temp`, testimonios/reseñas sin `approved`, datos sin `validated`, falta de GA ID, Maps, política en borrador). No bloquea el build de preview, sí es la puerta antes del lanzamiento.

Criterios:
1. Las 7 páginas + privacidad + 404 funcionan, pre-renderizadas, con su título, descripción, canonical y JSON-LD dentro del HTML.
2. Capturas con Playwright de todas las rutas en 390, 768 y 1280 px, revisadas visualmente (texto sobre foto legible, sin desbordes, sin saltos de layout).
3. Lighthouse mobile en `/`, `/casamientos/` y `/contacto/`: Performance ≥ 90, Accesibilidad ≥ 95, SEO 100 (con fotos provisorias; en Fase 2 se vuelve a medir).
4. Navegable solo con teclado, foco visible, `axe-core` sin errores graves, objetivos táctiles ≥ 44px, contraste AA.
5. `prefers-reduced-motion` desactiva todo el motion; el sitio es legible sin JS.
6. Formulario validado y probado contra un endpoint de prueba (o simulado), con estados de éxito y error.
7. `check:content` y `check:links` en verde.

## 11. Cómo trabajar

1. Leer los inputs y resumir en 10 líneas con dudas. Seguir sin esperar salvo falta de un dato crítico.
2. Orden: scaffolding, tooling y `check:*` → contenido tipado desde el documento → tokens de diseño, layout (header, menú, pie, botón de WhatsApp) → sistema de slots de fotos → **Inicio**.
3. **Checkpoint 1 (pausar):** al terminar Inicio, mostrar capturas mobile (390) y desktop y listar decisiones de diseño tomadas (paleta, tipografías, ritmo). No seguir hasta recibir OK de Santi.
4. Después: Casamientos, Eventos de empresa, Espacios, Eventos reales (galería con lightbox propio sobre `<dialog>`: teclado, Esc, flechas, swipe, foco atrapado), FAQ, Contacto (formulario + Apps Script), privacidad y 404, SEO y analítica, QA.
5. Commits atómicos con mensajes claros. Si una decisión de diseño o de alcance no está cubierta acá, pausar y preguntar.
6. Entregar `README.md` (comandos, cómo cambiar contenido y fotos) y `docs/INFORME-FASE1.md` con: qué se hizo, capturas, números de Lighthouse, erratas corregidas, `COPY-CAMBIOS.md`, pendientes del cliente y decisiones que necesitan OK.

## 12. Fuera de alcance

- Fotos finales (Fase 2).
- Publicación en producción, DNS, cambio del dominio, redirecciones desde WordPress y hosting en el VPS.
- Sistema de reservas o pagos online, panel de administración, blog.
- Integración con la Places API, campañas, gestión de redes sociales.
- Diseño de un logo nuevo (usar el actual; pedir vectorial al cliente).

## Anexo: lo que tiene que pasar el cliente (para el reporte de pendientes)

1. Logo en vectorial o alta resolución.
2. Confirmación del WhatsApp oficial (titular y enlace) y correo con dominio propio.
3. Enlace al perfil de Google Maps y selección de reseñas a mostrar.
4. Autorización de nombres y fotos en testimonios y eventos reales; ejemplos reales de eventos de empresa si existen.
5. Plan de lluvia concreto, aforo cubierto, disponibilidad de la ampliación a 520 m², servicios de cada paquete, capacidad máxima, cantidad de vehículos.
6. Quién atiende las consultas y cómo se coordinan las visitas.
7. Revisión de la política de privacidad y ID de Google Analytics.
