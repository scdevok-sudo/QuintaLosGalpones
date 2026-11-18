# Informe de estado: Quinta Los Galpones

Fecha: 17/11/2026. Auditoría de solo lectura sobre la rama `main` con el árbol de trabajo tal como estaba (hay cambios sin commitear, ver 12). Lo único que escribí es este archivo y la carpeta vacía `docs/informe-estado/`. Los scripts auxiliares que usé (Lighthouse con 4 categorías, chequeo de enlaces con páginas planas, análisis de SEO del HTML) quedaron fuera del repo, en el directorio temporal de la sesión.

**Nota sobre los briefs.** En `docs/` están `BRIEF.md` (Fase 1) y `BRIEF-V2.md` (v2). Los anexos v2.2 y v2.3 **no están como archivos** en el repo: solo se los menciona en `docs/COPY-CAMBIOS.md` y en `docs/checkpoint5/CRITICA.md` ("el anexo v2.3 no está en `docs/`"). Los chequeos contra v2.2 y v2.3 los hice a través de lo que citan esos documentos y de `check:tells`, no contra el texto original. Los dos briefs de la raíz (`brief-quinta-…fase1.md`, `…v2-direccion-visual.md`) son copia idéntica de los de `docs/` (mismo tamaño en bytes).

---

## 1. Resumen

1. **Avance aproximado: 55 %.** Criterio: páginas previstas 5 de 9 construidas (Inicio, Casamientos, Espacios, Contacto, 404) pesan 50 %; infraestructura (formulario con backend, analítica, SEO completo, migración, despliegue) 30 %; fotos finales 20 %. Lo construido está bien terminado; lo que falta es de volumen.
2. **Faltan 4 páginas:** Eventos de empresa, Eventos reales, Preguntas frecuentes y Política de privacidad. Su contenido tipado existe (`src/content/empresas.ts`, `reales.ts`, `faq.ts`), pero no tienen ruta (`app/routes.ts`).
3. **El menú y el pie enlazan a esas 4 páginas**, así que hoy son 404 en cada página (20 enlaces rotos reales, tabla 3).
4. **El formulario no puede enviar:** no existe `apps-script/Code.gs` ni endpoint (`VITE_FORM_ENDPOINT` vacío). Cualquier envío muestra el mensaje de error. No hay mail de aviso ni respuesta automática.
5. **No hay GA4:** `track()` existe pero nada inyecta el script `gtag`. Tampoco hay aviso de cookies ni política.
6. **WhatsApp 11 5249-8834 está publicado** (`wa.me/5491152498834` en el HTML) con `validated: false`. El brief 2.3 dice que lo no validado no se muestra.
7. **Fotos:** el sitio compilado usa 14 fotos provisorias de 1024 px de ancho. Hay 59 fotos reales del cliente sin usar (128 MB) en `imagenes/`, y la Fase 2 está empezada en el árbol de trabajo (`photos.config.json`, `docs/fotos/`), sin commitear y sin script `photos:build` en `package.json`.
8. **Rendimiento bueno:** Lighthouse móvil, mediana de 5, Performance 97, 99, 97, 86 y 100. Contacto es la más floja (86, TBT 476 ms) y Espacios y Contacto tocan el límite de LCP (2,49 s).
9. **`check:links` está roto:** no reconoce las páginas planas (`casamientos.html`) y marca 18 enlaces rotos de los cuales solo 4 destinos son reales. Un script que miente no sirve como puerta de lanzamiento.
10. **Bloquea el lanzamiento:** las 4 páginas, backend del formulario, fotos finales, datos del cliente (WhatsApp, correo, Maps), mapa de redirecciones y despliegue documentado. Estimación: **41 a 65 horas**.

---

## 2. Mapa de rutas

| Página | Estado | Qué falta | Evidencia |
|---|---|---|---|
| `/` Inicio | Terminada (contenido provisorio) | Fotos finales (usa 10 fotos distintas, la meta es 12 a 20). Testimonios ocultos (2 de 3 aprobados necesarios). Interruptor Sol/Lluvia usa foto provisoria forzada por `VITE_PREVIEW_PENDING=true` en `.env.local`. | `dist/index.html`, `src/content/home.ts`, `check:launch` |
| `/casamientos` | Terminada (contenido provisorio) | Misma foto de hero que Inicio (p09). Sin prueba social. Fotos finales. | `app/routes/casamientos.tsx`, `docs/checkpoint6/CRITICA.md` |
| `/espacios` | Terminada, **sin commitear**, sin checkpoint ni crítica propia | Foto de baños es una provisoria de flores (`espacios.banos` = p08) y no se usa (no aparece en el HTML). Revisión visual. | `app/routes/espacios.tsx` (`??` en git), `dist/espacios.html` |
| `/contacto` | Terminada, **sin commitear** | Backend del formulario. Foto de la entrada es provisoria (p01). Sin enlace a Maps validado. | `app/routes/contacto.tsx`, `app/components/ContactForm.tsx` |
| `/eventos-empresariales` | **Falta** | Ruta y página. Contenido listo en `empresas.ts`. | `app/routes.ts` |
| `/eventos-reales` | **Falta** | Ruta, galería agrupada, lightbox con `<dialog>`, filtro. Contenido en `reales.ts`. No hay fotos aprobadas de eventos. | `app/routes.ts`, `slots reales.1..9` |
| `/preguntas-frecuentes` | **Falta** | Ruta, acordeón `<details>`, JSON-LD `FAQPage`. Contenido en `faq.ts`. | `app/routes.ts` |
| `/politica-de-privacidad` | **Falta** | Redacción del borrador (Ley 25.326) y revisión legal. | `app/routes.ts`, `Footer.tsx` enlaza a ella |
| 404 | Terminada | Enlaza a las 7 secciones, 3 de las cuales no existen. Accesibilidad 95 (no 100) en Lighthouse, causa no analizada. | `app/routes/not-found.tsx`, `dist/404.html` |

---

## 3. Verificaciones automáticas

| Chequeo | Resultado | Detalle |
|---|---|---|
| `npm run typecheck` | OK | exit 0. |
| `npm run build` | OK | exit 0, 4 rutas más 404, "(noindex)". |
| `npm run check:content` | OK | 7 archivos. Solo revisa `dist/*.html/txt/xml`. |
| `npm run check:tells` | OK | 42 archivos. |
| `npm run test:tells` | OK | 24 de 24 casos (reglas probadas con casos negativos). |
| `npm run check:nojs` | OK | 19 comprobaciones (preview en 4173). |
| `npm run check:panel` | OK | 6 tamaños de pantalla, panel 33 % y botón visible. |
| `npm run check:routes` | OK con un aviso | 301 de `/ruta/` a `/ruta`, canonical y `og:url` coinciden, 404 real. Terminó con `Assertion failed ... async.c` de Node en Windows al cerrar (tras imprimir todo OK). Sin sitemap porque `VITE_NOINDEX=true`. |
| `npm run check:launch` | Lista 15 pendientes | Ver 5. **No avisa** de las 4 páginas faltantes ni de enlaces rotos. |
| `npm run check:links` | **FALLA (18)** | **El script es el que está mal**, no todo lo que marca: solo indexa `index.html` y no ve `casamientos.html`, `espacios.html`, `contacto.html`. |
| Enlaces reales rotos (script propio, páginas planas) | **20 (en 4 destinos)** | Ver la lista de abajo. |
| `check:motion`, `check:express`, `check:header`, `measure:tap` | No corridos | No están en `package.json` salvo `measure:tap`; `measure:tap` no lo corrí (no verificado). |
| Contraste del recorrido a 0/25/50/75/100 % | No verificado | Lo exige el brief v2 sección 6; no hay registro en `docs/`. |
| Capturas 390/768/1280 de Espacios y Contacto | No verificado | No hay checkpoint con capturas de esas dos páginas. |

**Enlaces rotos reales** (cada destino aparece en las 5 páginas, por el menú y el pie):

| Destino | Origen del enlace | Estado |
|---|---|---|
| `/eventos-empresariales` | menú, 404, Inicio (CTA "Consultar por un evento de empresa", 2 veces) | no existe |
| `/eventos-reales` | menú, 404 | no existe |
| `/preguntas-frecuentes` | menú, 404 | no existe |
| `/politica-de-privacidad` | pie | no existe |

Las anclas (`#lluvia`, `#visita`, `#formulario`, `#propuesta`) resuelven en las páginas existentes.

---

## 4. Lighthouse móvil (mediana de 5, `npm run build` + preview en 4173)

Cuatro categorías, throttling por defecto. Peso de JS = transferencia de scripts en la carga.

| Página | Perf | A11y | Best Pr. | SEO | LCP | TBT | CLS | JS | ¿Cumple Perf ≥ 85 y LCP ≤ 2,5 s? |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 97 | 100 | 100 | 69* | 2,12 s | 151 ms | 0 | 127 KB | Sí |
| `/casamientos` | 99 | 100 | 100 | 69* | 2,11 s | 77 ms | 0 | 122 KB | Sí |
| `/espacios` | 97 | 100 | 100 | 69* | 2,49 s | 114 ms | 0 | 122 KB | Sí, al límite del LCP |
| `/contacto` | 86 | 100 | 100 | 69* | 2,49 s | **476 ms** | 0,015 | 124 KB | Sí, al límite (86 y 2,49) |
| `/404` | 100 | 95 | 100 | 69* | 0,76 s | 42 ms | 0 | 117 KB | Sí |

\* SEO 69 es esperado: el build lleva `noindex` y `robots.txt` con `Disallow: /` (falla la auditoría "es rastreable"). Hay que **volver a medir con `VITE_NOINDEX=false`**; no lo hice porque implica reconstruir `dist/` con otra configuración. Los 5 resultados por página varían ±5 puntos entre corridas.

Peso del JS: el brief fija < 150 KB gzip. La transferencia medida es 117 a 127 KB. Los archivos mayores de `dist/assets` son `entry.client` 215 KB y `jsx-runtime` 129 KB sin comprimir.

---

## 5. Copy y datos sin validar

| Dato | Estado en `site.ts` | ¿Se publica? | Dónde |
|---|---|---|---|
| WhatsApp 11 5249-8834 | `validated: false` | **Sí**, como enlace `wa.me/5491152498834` (no se muestra el número en texto) | `whatsappAvailable = true` (comentado como decisión de preview); HTML de Inicio, Casamientos, Espacios, Contacto |
| Correo | `""`, `validated: false` | No | `Footer.tsx`, JSON-LD |
| Perfil de Google Maps | `""`, `validated: false` | No | Footer, JSON-LD, reseñas |
| Coordenadas | `null`, `validated: false` | No | JSON-LD |
| GA4 | vacío | No | sin loader (ver 10) |
| Rangos de invitados ("Hasta 100", "De 100 a 200", "Más de 200") | Sin marca de validación | **Sí**, en el formulario de Contacto y el panel | `ContactForm.tsx`, `Express.tsx`; `COPY-CAMBIOS.md` los marca "pendiente de confirmar" |
| 520 m² | Del copy, con "posibilidad de ampliar" | Sí, hedged, en 3 páginas | Copy del cliente; pendiente de Iván si está disponible e incluida |
| 320 m², 6.000 m², 500 m de Panamericana, ventilación y calefacción | Del copy | Sí | — |
| Testimonios Daiana V. y Antonella R. | `approved: false` | **No** (sección oculta con menos de 3 aprobados) | `check:nojs` lo comprueba |
| Reseñas de Google | `[]` | No | `reviews.ts` |
| Precio / "desde" | No existe | No | brief v2 7.4: bloque "Cómo se arma tu presupuesto" no está construido |
| Capacidad 350, 200 vehículos, all inclusive, Hotmail, Michelini | — | **No** (`check:content` verde) | — |

Cadenas internas del documento del cliente: ninguna aparece en `dist/` (`check:content`). `COPY-CAMBIOS.md` está al día hasta v2.3 e **incluye Contacto y Espacios solo parcialmente**: no registra el texto de los avisos nuevos de Contacto ("El formulario necesita JavaScript…", "Si todavía no la tenés, dejalo vacío.", "Contanos tu nombre.", etiquetas "Nombre de la organización") ni lo agregado en Espacios (no verificado línea por línea).

---

## 6. Formulario y consulta

| Punto | Estado | Evidencia |
|---|---|---|
| Panel de consulta (popover nativo) | Funciona sin JS y antes de hidratar; ver `check:nojs` y `check:panel` | `Express.tsx`, `check:*` |
| Campos del panel | Tipo, fecha (opcional), rango de invitados, nombre y medio de contacto | `Express.tsx` |
| Campos de Contacto | Nombre, correo, WhatsApp, tipo, organización (si empresa), fecha opcional, rango de invitados, mensaje | `ContactForm.tsx` |
| Validación | Nombre obligatorio y al menos un medio de contacto, con `aria-describedby` y foco al error | `ContactForm.tsx` |
| Antispam | Honeypot `sitio_web` y tiempo mínimo 2,5 s | `ContactForm.tsx`, `Express.tsx:138`. Si el bot cae, finge éxito. |
| Endpoint | **No existe.** `VITE_FORM_ENDPOINT` vacío; no hay carpeta `apps-script/` | `.env.local`, `ls apps-script` |
| Resultado hoy | Todo envío cae en el `catch` y muestra "No pudimos enviar la consulta…" con enlace a WhatsApp | `ContactForm.tsx` (`throw new Error("sin endpoint")`) |
| Mail de aviso al cliente y respuesta automática | **No existen** (brief 7.1 y v2 7.3) | falta `Code.gs` |
| Mensaje de WhatsApp | Sale completo: variantes por contexto con corchetes literales; el del panel va completado con lo elegido | `src/lib/whatsapp.ts` |
| `contactoReady` | **`true`** (cambiado en el árbol de trabajo). El comentario sobre él en `site.ts` sigue diciendo "todavía no existe" y quedó viejo. | `src/config/site.ts:20` |
| Sin JS | Formulario oculto con `noscript` y aviso con enlace a WhatsApp; los CTA del panel abren por `popovertarget` | `check:nojs` OK |
| `?tipo=empresa` | Preselecciona el tipo (se lee en `useEffect`, es decir después de hidratar) | `ContactForm.tsx` |
| Eventos GA4 del panel (abierto, paso 2, salida, envío) | No verificado; solo `contacto_envio` y `click_como_llegar` en Contacto | `grep track(` |

---

## 7. Fotos

| Ítem | Dato |
|---|---|
| Fotos provisorias distintas en el sitio | **14** (`p01`…`p14`), todas `temp: true`, 43 slots las referencian (`check:launch` dice 42) |
| Resolución | 1024 px de ancho; `p01` y `p02` solo 1024×461; `p14` 1024×792 |
| Peso (webp) | 27 KB (p08) a 147 KB (p03); jpg duplicados en `public/photos-temp/` (sin uso aparente) |
| Slot para hero de 21:9 sobre pantalla ancha | usa `p01` de 461 px de alto: queda ampliada en desktop |
| Repeticiones | `p09` en hero de Inicio y de Casamientos; `p13` en 6 slots (incluye `lluvia.cubierto`) |
| `lluvia.cubierto` | `pending: true`. El interruptor Sol/Lluvia solo aparece porque `.env.local` tiene `VITE_PREVIEW_PENDING=true`. Sin esa variable (producción) **no se muestra** |
| Reales (`reales.1..9`) | Definidos en `photos.ts`, con `approved: false`, sin página que los use |
| Fotos reales del cliente | **59 en `imagenes/Para Diego-1-001/Para Diego/` (128 MB)**, 14 con lado largo < 1600 px, varias PNG de 3 a 4 MB con aspecto de capturas de pantalla (verticales, ~1000×1500). No las revisé visualmente |
| Fase 2 | En curso y sin commitear: `photos.config.json`, `docs/fotos/ANALISIS.md`, `docs/fotos/photos.config.draft.json`. **No existen** los scripts `photos:review` ni `photos:build` en `package.json` ni en `scripts/` (el config los nombra) |
| `.gitignore` | Ya ignora `imagenes/` (cambio sin commitear), así que no se versionan los 245 MB |

---

## 8. SEO técnico

| Punto | Resultado |
|---|---|
| `title` y `description` únicos | Sí en las 5 páginas. Descripciones de 103 a 140 caracteres. |
| `lang` | `es-AR` |
| Canonical, `og:url` | Sin barra final, coincide (`check:routes`) |
| Open Graph / Twitter | Presentes. Imagen única `og-default.jpg` 1200×630 para todas las páginas (no hay imagen por página). |
| `noindex` | `robots: noindex, nofollow` en todas con `VITE_NOINDEX=true`; `robots.txt` `Disallow: /`, sin `sitemap.xml`. Al poner `false`, `postbuild.mjs` genera ambos (lógica leída, **no ejecutada**). La página 404 lleva `noindex` propio siempre. |
| JSON-LD | Solo `LocalBusiness + EventVenue` en Inicio, Casamientos, Espacios y Contacto. **Faltan `FAQPage` y `BreadcrumbList`:** `breadcrumbLd()` existe en `seo.ts` pero no se usa en ninguna ruta. Sin `aggregateRating` (correcto). |
| H1 | Uno por página. Jerarquía sin saltos graves (Inicio `1222333322223332`). |
| `alt` | Ninguna imagen sin `alt`; 2 por página con `alt=""` (decorativas). |
| Datos del negocio en JSON-LD | Dirección e Instagram; teléfono, correo, Maps y coordenadas se omiten por `validated: false` |

---

## 9. Migración desde el sitio actual

Revisé el sitio viejo (WordPress) leyendo sus sitemaps públicos:

| URL vieja | Qué es | Destino propuesto |
|---|---|---|
| `https://quintalosgalpones.com/` | Única página (modificada 01/09/2025) | `/` (misma URL, no necesita redirección) |
| `https://quintalosgalpones.com/hello-world/` | Entrada de ejemplo de WordPress | 301 a `/` (o 410) |
| `/wp-sitemap-*.xml`, `/category/…`, `/author/…`, `/feed/`, `/wp-json/`, `/wp-login.php`, `/wp-admin/` | Artefactos de WordPress | 301 a `/` o 410; hay que **pedir al hosting el listado de accesos reales** y revisar Search Console |

Estado en el repo: **no hay mapa de redirecciones.** `public/.htaccess` tiene solo la regla de barra final (301 de `/ruta/` a `/ruta`), el rewrite a `ruta.html` y el `ErrorDocument 404`. El README documenta la variante para el vhost de OpenLiteSpeed. `check:routes` verificó las reglas contra el servidor de preview propio (`scripts/serve-dist.mjs`), **no contra OpenLiteSpeed real** (el README lo admite). Plantilla para completar:

```apache
# Después de la regla de barra final, antes del rewrite a .html
RewriteRule ^hello-world/?$ / [R=301,L]
# RewriteRule ^wp-sitemap.*\.xml$ /sitemap.xml [R=301,L]
# RewriteRule ^(category|author)/.* / [R=301,L]
```

---

## 10. Legal y analítica

| Punto | Estado |
|---|---|
| Política de privacidad | **No existe** (404). `check:launch` ya dice "en borrador sin validación legal" pero no hay borrador. |
| Aviso de cookies | No existe. Hoy no hay cookies propias; GA4 y el mapa de Google las traerían. |
| GA4 por variable de entorno | Solo está la variable (`VITE_GA_ID`) y `track()`. **No hay código que cargue `gtag.js`** (`grep gtag` solo en `analytics.ts`). No hay consentimiento. |
| Cookies de terceros | Mapa de Google (`MapFacade.tsx`): iframe recién al hacer clic en "Ver el mapa" (verificado: 0 `<iframe>` en el HTML). Fuentes autoalojadas (`@fontsource`): sin pedidos externos. WhatsApp y Instagram son enlaces salientes. |
| Mapa de cookies a documentar | Pendiente: Google Maps (tras clic), GA4 (cuando se agregue). |

---

## 11. Despliegue

| Punto | Estado |
|---|---|
| Cómo se publica | **Parcial.** El README explica que `npm run build` genera `dist/` y cómo configurar OpenLiteSpeed (rewrite, cache `immutable` para `/assets/`, `no-cache` para `.html`, gzip). No describe la subida al VPS (rsync/scp, ruta, usuario) ni Cloudflare. |
| Variables de entorno | Documentadas en `.env.example` y el README: `VITE_SITE_URL`, `VITE_NOINDEX`, `VITE_FORM_ENDPOINT`, `VITE_GA_ID`, `VITE_PREVIEW_PENDING`. |
| Rollback | **No documentado.** |
| Preview a producción | Falta: poner `VITE_NOINDEX=false`, quitar `VITE_PREVIEW_PENDING`, definir endpoint y GA, reconstruir, repetir `BASE_URL=… check:routes` en el servidor real, enviar sitemap a Search Console, y la migración (9). |
| Riesgo del build local | `dist/` actual se compiló con `.env.local` (`NOINDEX=true` y `PREVIEW_PENDING=true`): no es un build de producción. |

---

## 12. Deuda y riesgos

- **Árbol de trabajo sin commitear:** Espacios, Contacto, `ContactForm.tsx`, 3 carpetas de checkpoints, `photos.config.json`, `docs/fotos/` y 9 archivos modificados. El último commit (45fd000) no incluye ninguna de las dos páginas nuevas.
- **`check:links` roto** (ver 3) y **`check:launch` ciego** a páginas faltantes y enlaces rotos.
- **Dependencias sin uso:** `@react-router/serve` (no se importa en ningún lado; el sitio es `ssr: false`) y `playwright` solo en scripts. `@react-router/node` e `isbot` sí se usan (`entry.server.tsx`).
- **Scripts huérfanos** fuera de `package.json`: `check-express.mjs`, `check-header.mjs`, `check-motion.mjs`, `record.mjs`, `screenshots*.mjs`, `temp-webp.mjs`.
- **Archivos sueltos:** `logo-quinta-los-galpones.zip` y los briefs duplicados en la raíz; `public/photos-temp/*.jpg` duplican los `.webp`.
- **Comentario viejo** en `site.ts` ("La página /contacto/ todavía no existe") con `contactoReady = true`.
- **Contacto:** TBT 476 ms y CLS 0,015 (el único con CLS > 0): el formulario y el panel compiten por el hilo principal.
- **Accesibilidad de la 404 en 95:** no investigué la causa.
- **Inconsistencia entre briefs:** el brief 1 pide `dist/<ruta>/index.html` con barra final; la decisión posterior fue páginas planas sin barra (`0b7efdc`). El brief 1 sigue diciendo "con trailing slash". Conviene dejar registrado cuál manda (hoy manda el código).
- **Foto de la crítica 6:** la fotografía del parque tiene un borde oscuro a la derecha en el archivo provisorio.
- **Sin tests del envío real**, porque no hay endpoint.
- **Dependencia del cliente:** el plan de lluvia con foto real, WhatsApp oficial, autorizaciones y rangos de invitados bloquean contenido, no el código.

---

## 13. Pendientes del cliente (Iván), por impacto

| # | Pregunta exacta | Dónde se usa |
|---|---|---|
| 1 | ¿El WhatsApp 11 5249-8834 es el oficial? ¿A nombre de quién está y quién lo atiende? | `src/config/site.ts` `whatsapp.validated`; todos los CTA (`whatsapp.ts`) |
| 2 | ¿Qué correo con dominio propio usamos para recibir consultas y como remitente de la respuesta automática? | `site.ts` `email`; Apps Script (por construir); pie; JSON-LD |
| 3 | ¿Qué fotos de las 59 que pasaron podemos publicar, y quién aparece en ellas autoriza su uso? ¿Hay fotos del armado cubierto con lluvia o con el mismo evento de día? | `photos.config.json`, slot `lluvia.cubierto`, `photos.ts` `approved`, `reales.*` |
| 4 | ¿Cuál es el enlace del perfil de Google Maps y qué reseñas quieren mostrar? | `site.ts` `mapsUrl`; `GoogleReviews.tsx`; `reviews.ts`; pie |
| 5 | ¿Daiana V. y Antonella R. autorizan que se publique su nombre y testimonio? ¿Hay un tercero? | `home.ts` `testimonios.items[].approved`; regla de 3 en `home.tsx` |
| 6 | ¿Los rangos "hasta 100", "100 a 200", "más de 200" les sirven? ¿Cuál es la capacidad real de cada armado (y de 350, sentados y en lluvia)? | `ContactForm.tsx` `RANGOS`, `Express.tsx` |
| 7 | ¿La ampliación a 520 m² está disponible e incluida siempre? ¿Cuál es el plan de lluvia concreto para ceremonia, recepción y fiesta? | `home.ts` `lugar`, `casamientos.ts`, `faq.ts` |
| 8 | ¿Publicamos un "desde" o rango de precios? ¿Qué incluye cada paquete? | bloque "Cómo se arma tu presupuesto" (no construido), `faq.ts` "servicio integral" |
| 9 | ¿Tienen ejemplos reales de eventos de empresa (fotos con aprobación)? ¿Y de 4 o 5 eventos con cantidad de invitados y época? | `reales.ts` `categories[empresa].visible`, pies de foto |
| 10 | ¿Quién responde las consultas y las visitas, y en cuánto tiempo real? (no se publica plazo hasta saberlo) | respuesta automática de Apps Script, `form.success` |
| 11 | ¿El logo vectorial original? | `public/brand/*`, `check:launch` |
| 12 | ¿Quién revisa la política de privacidad y cuál es el ID de Google Analytics 4? | página de privacidad, `VITE_GA_ID` |
| 13 | ¿Nos pasan el listado de URLs que quieren conservar del WordPress (si hay más de `/`)? ¿Con o sin `www`? | `.htaccess`, `VITE_SITE_URL` |

---

## 14. Pendientes técnicos

**Bloquea lanzamiento**

| Tarea | Horas | Archivo o página |
|---|---|---|
| Página Eventos de empresa (contenido listo) | 4 a 6 | `app/routes/empresas.tsx`, `routes.ts`, `react-router.config.ts` |
| Página Preguntas frecuentes con `<details>` y `FAQPage` JSON-LD | 3 a 4 | `faq.ts`, `seo.ts` |
| Página Política de privacidad (borrador) y revisión | 2 a 3 | nueva ruta |
| Página Eventos reales con galería agrupada y lightbox `<dialog>` | 8 a 12 | `reales.ts` |
| Apps Script `Code.gs` (fila en planilla, aviso, autorrespuesta con `replyTo`) y prueba de punta a punta | 4 a 7 | `apps-script/Code.gs`, `ContactForm.tsx`, `Express.tsx` |
| Fase 2 de fotos: scripts `photos:review` y `photos:build` (AVIF/WebP, sin EXIF), reemplazo de slots, `approved` | 6 a 10 | `photos.config.json`, `photos.ts`, `public/photos` |
| Mapa de redirecciones, `.htaccess`, prueba en OpenLiteSpeed real y documentación de despliegue y rollback | 3 a 5 | `public/.htaccess`, `README.md` |
| Cargar GA4 por `VITE_GA_ID` sin bloquear el render, con consentimiento si se decide | 2 a 3 | `root.tsx`, `analytics.ts` |
| Decidir qué hacer con WhatsApp sin validar (ocultar o validar) | 0,5 a 1 | `site.ts` `whatsappAvailable` |

**Importante**

| Tarea | Horas | Archivo |
|---|---|---|
| Reparar `check:links` (páginas planas) y hacer que `check:launch` avise páginas y enlaces rotos | 1 a 2 | `scripts/check-links.mjs`, `check-launch.mjs` |
| QA final: capturas 390/768/1280 de las 9 páginas, axe, contraste del recorrido (0/25/50/75/100 %), Lighthouse con `NOINDEX=false` | 4 a 6 | todas |
| Bajar TBT de Contacto (476 ms) y su CLS | 2 a 4 | `contacto.tsx`, `ContactForm.tsx` |
| `BreadcrumbList` en páginas internas | 1 | `seo.ts` |
| Commitear en bloque ordenado (Espacios, Contacto, fotos) | 1 | git |

**Mejora**

| Tarea | Horas | Archivo |
|---|---|---|
| Imagen Open Graph por página (hoy una sola) | 1 a 2 | `seo.ts` |
| Limpieza: dependencia `@react-router/serve`, scripts huérfanos, zip y jpg duplicados, comentario viejo de `contactoReady` | 1 | repo |
| Bloque "Cómo se arma tu presupuesto" (si Iván lo aprueba) | 2 a 3 | `casamientos.tsx` |
| Completar `COPY-CAMBIOS.md` con Contacto, Espacios y páginas nuevas | 1 | `docs/COPY-CAMBIOS.md` |

---

## 15. Horas restantes estimadas

Mínimo **~41 h**, máximo **~65 h** (bloqueantes e importantes; sin contar "mejora" ni la espera de respuestas del cliente). Sumando "mejora": 46 a 72 h.

---

## 16. Riesgos y supuestos

- Supuesto: "terminada" significa construida y verificada por scripts y capturas de checkpoints anteriores; no hice una pasada visual propia de cada página.
- Supuesto: el ítem 6 de tu lista pide Best Practices y peso de JS; los medí con un script propio porque `scripts/lighthouse-median.mjs` mide solo Performance, Accesibilidad y SEO.
- Los Lighthouse se midieron en una máquina local de Windows con otras tareas posibles; la variación entre corridas es de unos puntos.
- No pude ejecutar contra OpenLiteSpeed ni el VPS; las reglas de rewrite se probaron solo en `serve-dist.mjs`.
- Hay trabajo de Fase 2 de fotos en curso sin commitear. Si es de otra sesión, esta auditoría refleja el árbol tal como estaba al correrla.
- No abrí las 59 fotos del cliente; su aptitud (nitidez, personas, aprobación) es desconocida.
- Riesgo de lanzamiento: sin el endpoint, el primer visitante que envíe el formulario ve un error y la consulta se pierde.
- Riesgo de SEO: al pasar de `noindex` a indexable, 4 enlaces de navegación rotos en cada página; corregir antes de abrir la indexación.
- Riesgo legal: se piden nombre, correo, teléfono y mensaje sin política de privacidad publicada.

---

## 17. Plan sugerido

1. Commitear lo que está sin commitear (Espacios, Contacto, fotos), con commits atómicos.
2. Enviar a Iván el bloque 13 (preguntas 1 a 6 primero) para que las respuestas lleguen mientras se programa.
3. Construir Eventos de empresa, FAQ y Privacidad (menor esfuerzo, eliminan 3 de los 4 enlaces rotos).
4. Apps Script y prueba real del formulario (sin esto el sitio no recibe consultas).
5. Cerrar la Fase 2 de fotos (scripts, reemplazo de provisorias, aprobaciones) y reemplazar las repeticiones de `p09` y `p13`.
6. Eventos reales con lightbox, una vez que haya fotos aprobadas.
7. GA4, mapa de redirecciones, documentación de despliegue y rollback.
8. Reparar `check:links` y `check:launch`; QA completo y Lighthouse con `NOINDEX=false`.
9. Despliegue en el VPS con `noindex`, repetir `check:routes` contra el dominio y, recién entonces, pasar a producción.
