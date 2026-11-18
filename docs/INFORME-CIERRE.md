# Informe de cierre: Quinta Los Galpones (fase 1)

Fecha: 17 y 18/11/2026. Parte de `docs/INFORME-ESTADO.md`. El sitio quedó **completo en preview (noindex), sin publicar**. Nada se subió al VPS ni se tocó DNS o WordPress.

El Bloque 4 (fotos) lo hizo otra sesión y está commiteado (`552077b`, `0f662b2`, `b3d41c2`, `4861e6f` y siguientes). No lo toqué, salvo `og:build` (imágenes Open Graph por página), que lee sus fotos ya procesadas.

## 1. Qué se hizo por bloque

| Bloque | Resultado | Horas reales |
|---|---|---|
| 1. Orden del repo | Commits atómicos de Espacios, Contacto, checkpoints y docs. `check:links` reescrito (entiende páginas planas) y `check:launch` ahora avisa páginas del menú inexistentes, enlaces rotos, rangos sin confirmar, política sin revisar, presupuesto sin aprobar y Eventos reales con fotos sin aprobar. Scripts huérfanos pasados a `package.json` (`check:express`, `check:header`, `check:motion`, `shots`, `shots:story`, `record`). Sin `@react-router/serve`. Comentario viejo de `contactoReady` corregido. **No hecho:** borrar archivos (ver sección 7). | ~1,5 |
| 2. Páginas | Eventos de empresa, Preguntas frecuentes (`<details>`, `FAQPage`), Política de privacidad (borrador), Eventos reales (filtro por anclas que funciona sin JS, lightbox `<dialog>` con teclado, Esc, flechas, swipe y foco restaurado). `BreadcrumbList` en todas las internas. 404 con su contenido sobre superficie de día (**tenía texto oscuro sobre fondo noche: ilegible**). Menú y pie solo enlazan a páginas que existen. | ~6 |
| 3. Formulario | `src/config/consulta.ts` (opciones, rangos, campos por tipo, antispam y envío) usado por panel y Contacto. `apps-script/Code.gs` (planilla, aviso con `replyTo`, autorrespuesta sin plazo, honeypot y tiempo mínimo en servidor, freno por minuto) con README de despliegue. Probado con endpoint simulado: éxito, validación, error, honeypot, `?tipo=empresa`, sin JS. TBT de Contacto de 955 a ~270 ms (ver 4). Eventos GA4: `express_abierto`, `express_paso2`, `express_salida`, `express_envio`, `contacto_envio`. | ~5 |
| 4. Fotos | Hecho por otra sesión. | no mido |
| 5. SEO, analítica y despliegue | GA4 por `VITE_GA_ID` (tras `load` y en idle, sin señales publicitarias). Open Graph 1200×630 por página (`npm run og:build`). Mapa de redirecciones del WordPress (`scripts/redirects.mjs`, `public/.htaccess`, probado en `check:routes`). `docs/DESPLIEGUE.md` con subida, caché, Cloudflare, rollback y lista de control. Bloque "Cómo se arma tu presupuesto" con flag. Build `NOINDEX=false` verificado: `robots.txt`, `sitemap.xml` con 8 páginas, canonical. | ~4 |
| 6. QA | Capturas 390/768/1280 de las 9 páginas (`docs/qa/`), axe-core, teclado y foco, objetivos táctiles, contraste del recorrido (`docs/qa/CONTRASTE.md`), grabaciones, Lighthouse. | ~4 |

Las horas son una estimación mía del esfuerzo de esta sesión, **no cronometradas**; el total ronda las 20 h frente a las 41 a 65 h que estimé. La diferencia viene de que las páginas reutilizaron el contenido ya tipado y de que las fotos las hizo otra sesión (6 a 10 h que no conté).

## 2. Páginas

| Página | Estado | Contenido | Evidencia |
|---|---|---|---|
| `/` Inicio | Terminada | Fotos reales parciales (hero, recorrido) | `docs/qa/inicio-*.png` |
| `/casamientos` | Terminada | Bloque de presupuesto oculto por flag | `casamientos-*.png` |
| `/eventos-empresariales` | **Nueva, terminada** | Fotos provisorias del sitio viejo (slots `empresas.*`) | `eventos-empresariales-*.png` |
| `/espacios` | Terminada | `espacios.banos` no se usa | `espacios-*.png` |
| `/eventos-reales` | **Nueva, terminada** | Fotos provisorias sin aprobar; historias sin título ni pie | `eventos-reales-*.png` |
| `/preguntas-frecuentes` | **Nueva, terminada** | Copy del documento | `preguntas-frecuentes-*.png` |
| `/contacto` | Terminada | Sin endpoint hasta desplegar el Apps Script | `contacto-*.png` |
| `/politica-de-privacidad` | **Nueva, borrador sin validación legal** | Texto nuestro | `politica-de-privacidad-*.png` |
| 404 | Terminada, corregida | — | `404-*.png` |

**La política de privacidad es un borrador sin validación legal.** Muestra un aviso visible hasta que `site.privacyReviewed.validated` pase a `true`.

## 3. Verificaciones

| Chequeo | Resultado |
|---|---|
| `typecheck`, `build` | OK |
| `check` (`check:content`, `check:tells`, `test:tells`) | OK, 24 de 24 casos negativos |
| `check:links` | OK, 9 páginas, 0 enlaces rotos |
| `check:nojs` | OK, 19 comprobaciones |
| `check:routes` | OK, 48 (barra final, canonical, 404 real, sitemap, 7 redirecciones del WordPress). Termina con un `Assertion failed ... async.c` de Node en Windows al cerrar, después de imprimir todo OK |
| `check:panel`, `check:header` | OK (6 pantallas, 6 anchos) |
| `measure:tap` | Mediana toque a panel: 122 ms sin hidratar, 329 ms con CPU 4x y red lenta |
| axe-core (390 y 1280, 9 páginas) | 0 errores graves, salvo un posible falso positivo del reloj decorativo del recorrido (`docs/qa/CONTRASTE.md`) |
| Teclado (70 tabulaciones por página) | Foco visible en todo; se corrigió la opción de tipo de evento de Contacto |
| Objetivos táctiles | Todo ≥ 44 px (se corrigió el logo del header, 40 px). Los radios de Contacto miden 18 px pero su etiqueta mide 48 px |
| Desbordes horizontales | Ninguno en 390, 768 ni 1280 |
| Contraste del recorrido (0, 25, 50, 75, 100 %) | 13,5:1 y 13,7:1 |

## 4. Lighthouse móvil (mediana, build `VITE_NOINDEX=false`, preview local)

| Página | Perf | A11y | Best Pr. | SEO | LCP | TBT | CLS | JS |
|---|---|---|---|---|---|---|---|---|
| `/` | 96 | 100 | 100 | 100 | 2,13 s | 209 ms | 0 | 137 KB |
| `/casamientos` | 95 | 100 | 100 | 100 | 2,27 s | 222 ms | 0 | 132 KB |
| `/eventos-empresariales` | 95 | 100 | 100 | 100 | 2,34 s | 192 ms | 0 | 132 KB |
| `/espacios` | 97 | 100 | 100 | 100 | 2,12 s | 159 ms | 0 | 132 KB |
| `/eventos-reales` | 99 | 100 | 100 | 100 | 0,79 s | 93 ms | 0 | 133 KB |
| `/preguntas-frecuentes` | 100 | 100 | 100 | 100 | 0,77 s | 73 ms | 0 | 129 KB |
| `/contacto` | 93 | 100 | 100 | 100 | 2,27 s | 272 ms | 0,015 | 134 KB |
| `/politica-de-privacidad` | 100 | 100 | 100 | 100 | 0,79 s | 69 ms | 0 | 128 KB |
| `/404` | 100 | 100 | 100 | 69* | 0,76 s | 57 ms | 0 | 127 KB |

\* La 404 lleva `noindex` a propósito, de ahí el 69. Todas cumplen Performance ≥ 85 y LCP ≤ 2,5 s. Las medianas son de 5 corridas (7 en Contacto, 5 en Inicio), medidas por separado.

**Cómo se arregló Contacto** (77, TBT 955 ms): el formulario es la causa (sin él, TBT 158). No eran el `<noscript>`, el campo de fecha ni los selectores `:has()`. Sacar `content-visibility` de esa sección bajó a ~330 ms; montar el formulario en idle (o enseguida si se llega por `#formulario`) lo dejó en ~150 a 270 ms. Costo: sin JS no cambia nada (el formulario ya era solo con JS); con JS aparece ~1 s después de cargar.

**Aviso sobre la medición:** durante la sesión otras sesiones corrían Lighthouse, vite y la generación de fotos sobre la misma máquina y el mismo preview (puerto 4173). Mis primeras corridas dieron TBT de 1600 ms hasta en la 404, y se repitieron cuando la máquina quedó libre. Los números de arriba son de corridas sin otras mediciones simultáneas. Aun así varían ±5 puntos entre corridas.

## 5. Qué quedó con flag

| Flag | Dónde | Estado | Para activar |
|---|---|---|---|
| `site.whatsapp.validated` | `src/config/site.ts` | false (el enlace `wa.me` igual se publica: `whatsappAvailable = true`) | validar número y titular |
| `site.email`, `mapsUrl`, `coordinates` | idem | false: no se muestran ni van al JSON-LD | cargar datos |
| `site.privacyReviewed` | idem | false: aviso de borrador visible | revisión legal |
| `site.presupuestoBloque` | idem | `validated: false`: no se muestra | aprobar el texto |
| `rangosValidated` | `src/config/consulta.ts` | false | confirmar rangos |
| `realesVisible` | `src/content/reales.ts` | **true** (visible en menú) | `false` para ocultarla |
| `Historia.datos.aprobado` | `reales.ts` | sin datos: fotos sin pie | cargar invitados, época y sector aprobados |
| `testimonios[].approved` | `src/content/home.ts` | false: sección oculta con menos de 3 | autorizaciones |
| Interruptor Sol/Lluvia | `photos.ts` `pending` | solo aparece con `VITE_PREVIEW_PENDING=true` | foto real del armado cubierto |

## 6. Pendientes del cliente (Iván)

| # | Pregunta exacta | Se usa en |
|---|---|---|
| 1 | ¿El 11 5249-8834 es el WhatsApp oficial? ¿A nombre de quién está y quién lo atiende? | `site.whatsapp`, todos los CTA |
| 2 | ¿Qué correo con dominio propio recibe las consultas? | `NOTIFY_EMAIL` del Apps Script, `site.email`, pie, JSON-LD |
| 3 | ¿Cuál es el enlace del perfil de Google Maps y qué reseñas quieren mostrar? | `site.mapsUrl`, `reviews.ts` |
| 4 | ¿Daiana V. y Antonella R. autorizan su nombre y testimonio? ¿Hay un tercer testimonio? | `home.ts` `testimonios` |
| 5 | ¿Podemos publicar las fotos marcadas con procedencia o rostros sin confirmar (F046, F048, F052, F015, F033, F049) y quienes aparecen lo autorizan? ¿Tienen los originales en mayor resolución? | `photos.config.json`, `check:launch` |
| 6 | ¿Hay fotos de eventos de empresa y del armado cubierto con lluvia? | slots `empresas.*`, `lluvia.cubierto` |
| 7 | ¿De 4 o 5 eventos reales: cantidad de invitados, época y sector? ¿Autorizan publicarlos? | `reales.ts` `historias[].datos` |
| 8 | ¿Les sirven los rangos "hasta 100", "100 a 200", "más de 200"? ¿Cuál es la capacidad real por armado? | `src/config/consulta.ts` |
| 9 | ¿Les gusta la pregunta "Ambiente que imaginás" (al aire libre, cubierto, los dos) del formulario? | `consulta.ts` `AMBIENTES` |
| 10 | ¿Aprueban el texto "Cómo se arma tu presupuesto"? ¿Publican un "desde"? | `site.presupuestoBloque`, `casamientos.ts` |
| 11 | ¿La ampliación a 520 m² está siempre disponible? ¿Cuál es el plan de lluvia concreto? | `home.ts`, `casamientos.ts`, `faq.ts` |
| 12 | ¿Quién responde las consultas y las visitas, y en cuánto tiempo real? | autorrespuesta del Apps Script |
| 13 | ¿Quién revisa la política de privacidad? ¿Cuál es el ID de GA4? ¿Con o sin `www`? ¿Qué otras URLs viejas quieren conservar? | `privacidad.ts`, `VITE_GA_ID`, `VITE_SITE_URL`, `.htaccess` |
| 14 | ¿Logo vectorial original? | `public/brand/*` |

## 7. Lo que no pude hacer, y por qué

- **Borrar archivos del Bloque 1.** El sistema de permisos bloqueó los borrados. Quedan: `logo-quinta-los-galpones.zip`, `brief-quinta-los-galpones-fase1.md` y `brief-quinta-los-galpones-v2-direccion-visual.md` (copias idénticas de `docs/BRIEF.md` y `docs/BRIEF-V2.md`), `public/photos-temp/*.jpg` (14, sin uso) y `scripts/temp-webp.mjs`. Para hacerlo: `git rm logo-quinta-los-galpones.zip brief-quinta-los-galpones-*.md public/photos-temp/*.jpg scripts/temp-webp.mjs`. (`temp-webp.mjs` solo sirve si siguen los jpg.)
- **Anexos v2.2 y v2.3 y los prompts de fotos.** No están en el repo ni en la PC (búsqueda en el árbol del proyecto). `docs/checkpoint5/CRITICA.md` ya lo advertía. También falta `docs/prompt-claude-code-procesar-fotos-quinta.md`. Si los tenés, copialos a `docs/`.
- **Buscador en Preguntas frecuentes:** no lo hice (el brief lo pedía solo "si es liviano"; con 10 preguntas no se justifica).
- **Probar en OpenLiteSpeed real.** Las reglas de rewrite y redirecciones se probaron solo con `scripts/serve-dist.mjs`. Después del primer deploy: `BASE_URL=https://dominio npm run check:routes`.
- **Probar el Apps Script real.** Probé el cliente contra un servidor simulado; `Code.gs` no se ejecutó en Google. Pasos en `apps-script/README.md`.
- **Aviso de cookies:** no hace falta hoy. No hay cookies propias, el mapa solo carga tras el clic y GA4 se pidió sin señales publicitarias. Si se activa GA4 con cookies de medición, conviene revisarlo con quien valide la política; el texto ya lo menciona.

## 8. Riesgos

- Eventos reales está visible con fotos provisorias sin aprobar: decidir antes de publicar (`realesVisible`).
- WhatsApp sin validar sigue publicado como enlace.
- El formulario se monta ~1 s después de cargar: quien toca "Enviar" antes de que aparezca no puede; se monta de inmediato con `#formulario` y al acercar el puntero o el foco.
- `check:routes` termina con una aserción de Node en Windows al cerrar; no afecta el resultado.
- El dist de preview se construyó con `.env.local` (`NOINDEX=true`, `PREVIEW_PENDING=true`): para publicar hay que reconstruir (ver `docs/DESPLIEGUE.md`).
- Otras sesiones editan este repo y el puerto 4173 al mismo tiempo: conviene que haya una sola persona o sesión midiendo.

## 9. Para publicar

1. Responder (o decidir sin respuesta) los puntos 1, 2, 5 y 8 de la sección 6.
2. Desplegar el Apps Script (`apps-script/README.md`) y copiar la URL `/exec` a `VITE_FORM_ENDPOINT`.
3. Decidir `realesVisible`, `site.whatsapp.validated` y `presupuestoBloque`.
4. Pedir al hosting el log de accesos y completar `scripts/redirects.mjs` y `public/.htaccess`.
5. Construir con `VITE_NOINDEX=false`, sin `VITE_PREVIEW_PENDING`, y seguir `docs/DESPLIEGUE.md`.
