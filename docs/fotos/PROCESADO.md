# Procesado de fotos

Resultado de `npm run photos:build` sobre las fotos de `imagenes/` (no se commitean). Las fotos derivadas están en `public/photos/`, el manifiesto en `src/data/photos.manifest.json` y la configuración en `photos.config.json`. Reemplazar originales: ver la sección Fotos del `README.md`.

## Resumen

- **1 ok**, **32 provisorias**, **26 bloqueadas** (de 59 fotos; la imagen Open Graph es otro recorte de F035).
- Pendientes entre las provisorias (una foto puede tener varios): resolución 32, procedencia 14, rostros 10.
- Solo AVIF (640, 960 y hasta 1440 o 2000 px, nunca más que el recorte) y un JPEG de respaldo por foto. No hay WebP. Las fotos de reserva (sin ranura) no se generan: `npm run photos:build -- ID`.
- Todas las salidas están en sRGB y sin EXIF, GPS ni miniaturas (lo verifica `photos:verify`).

## Fotos

| Original | ID | Nombre final | Ranura | Estado | Peso a 1440 (AVIF) | Nota |
|---|---|---|---|---|---|---|
| 05E8455F-6F87-4DAC-BFD6-2751F2F03D16.png | F001 | espacios-cubierto-galpon-armado-atardecer-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, resolucion. Reserva: sin ranura, no se genera. Misma toma que F056 pero pulida: posible versión retocada con IA |
| 16bc0bfd-4f38-43cd-83b2-5c89dd4f5c13.jpg | F002 | no se procesa | | bloqueada | | Duplicado de F055 |
| 37ad736c-c58c-49cb-bc3a-8ebf80e8bddf.jpg | F003 | recorrido-2-parque-palmera-atardecer-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, resolucion. Reserva: sin ranura, no se genera. Sin EXIF, nombre UUID |
| 3805E638-23E3-4615-B7A2-5DC18F2CFDD8.png | F004 | casamientos-galeria-mesa-larga-velas-noche-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, resolucion. Reserva: sin ranura, no se genera. Sin EXIF, nombre UUID |
| 38620F37-8205-4437-885D-EA696FFB5A85.png | F005 | espacios-parque-livings-arbol-noche-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, resolucion. Reserva: sin ranura, no se genera. Sin EXIF, nombre UUID; par de F012 |
| 5119907c-8e3c-4253-aecd-567acd5776fc.jpg | F006 | no se procesa | | bloqueada | | Igual a F018 (hash 0), peor resolución |
| 53FD6658-A400-45D5-8C25-F2C5476A0207.png | F007 | casamientos-hero-pareja-cesped-atardecer-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, rostros, resolucion. Reserva: sin ranura, no se genera. Sin EXIF, UUID; casi idéntica a F013; posible generada. No usar sin confirmar Verificar que no haya menores. |
| 7677FBD4-AEF2-4520-A4D3-933AA46763F1.png | F008 | no se procesa | | bloqueada | | Misma escena que F002/F055 |
| 7A3CB813-2F05-41D2-A79E-9A3182065C5E.png | F009 | espacios-cubierto-galpon-bolas-espejo-noche-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, resolucion. Reserva: sin ranura, no se genera. Sin EXIF, UUID; baja resolución |
| 97890C8B-3CB8-473A-B8ED-F78086E04564.png | F010 | no se procesa | | bloqueada | | Rostros, baja resolución |
| 99DE625B-AD76-44C8-A244-82AFE9CE4BC8.png | F011 | espacios-cubierto-galpon-nave-noche-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, resolucion. Reserva: sin ranura, no se genera. Sin EXIF, UUID |
| CE4E8F14-41D1-446A-A45B-94919031E098.png | F012 | no se procesa | | bloqueada | | Casi duplicada de F005 |
| E4B1F96B-5609-4FFF-85C0-794C1D985935.png | F013 | no se procesa | | bloqueada | | Casi duplicada de F007 |
| IMG_0024.PNG | F014 | no se procesa | | bloqueada | | Captura con interfaz y nombre de cuenta, música de terceros |
| IMG_0540.PNG | F015 | mapa-fachada-cabana-parque-atardecer-01 | contacto.entrada | provisoria-procedencia | 104 KB | pendientes: procedencia, rostros, resolucion. Única vista de la construcción; con gente en primer plano Verificar que no haya menores. |
| IMG_0578.PNG | F016 | recorrido-4-fogata-invitados-noche-01 | reserva (sin ranura, no se genera) | provisoria-rostros | no generada | pendientes: rostros, resolucion. Reserva: sin ranura, no se genera. Escena de fogata valiosa; pedir permiso o versión sin rostros Verificar que no haya menores. |
| IMG_0585.PNG | F017 | no se procesa | | bloqueada | | Marcos negros, posible menor |
| IMG_1759.PNG | F018 | casamientos-galeria-mesa-larga-invitados-tarde-01 | reserva (sin ranura, no se genera) | provisoria-rostros | no generada | pendientes: rostros, resolucion. Reserva: sin ranura, no se genera. Misma que F006 Verificar que no haya menores. |
| IMG_1782.PNG | F019 | no se procesa | | bloqueada | | Rostros, ruido |
| IMG_4483.PNG | F020 | no se procesa | | bloqueada | | Se ven menores (un bebé en brazos y un niño entre los invitados) y hay una mancha de retoque en el borde derecho |
| IMG_5174.JPG | F021 | casamientos-galeria-barra-larga-atardecer-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, rostros, resolucion. Reserva: sin ranura, no se genera. Par de F025 Verificar que no haya menores. |
| IMG_5256.PNG | F022 | no se procesa | | bloqueada | | Sobresaturada, baja resolución |
| IMG_5257.PNG | F023 | recorrido-4-fogata-siluetas-atardecer-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, resolucion. Reserva: sin ranura, no se genera. Color muy forzado |
| IMG_5920.PNG | F024 | no se procesa | | bloqueada | | Captura de video |
| IMG_6599.PNG | F025 | no se procesa | | bloqueada | | Par de F021, rostros |
| IMG_6637.PNG | F026 | espacios-parque-rincon-cartel-noche-01 | reserva (sin ranura, no se genera) | provisoria-resolucion | no generada | pendientes: resolucion. Reserva: sin ranura, no se genera. Reconocible de esta quinta |
| IMG_6675.PNG | F027 | espacios-parque-banco-flores-atardecer-01 | espacios.hero | provisoria-resolucion | 106 KB | pendientes: resolucion. Específica del lugar, sin gente |
| IMG_6813.PNG | F028 | cierre-noche-guirnalda-mesas-noche-01 | home.casamientos | provisoria-resolucion | 117 KB | pendientes: resolucion. Imagen fuerte de la noche |
| IMG_6821.PNG | F029 | espacios-cubierto-galpon-fiesta-noche-01 | reserva (sin ranura, no se genera) | provisoria-rostros | no generada | pendientes: rostros, resolucion. Reserva: sin ranura, no se genera. Ráfaga con F030/F031 Verificar que no haya menores. |
| IMG_6823.PNG | F030 | no se procesa | | bloqueada | | Luces de color poco coherentes; duplicada de F031 |
| IMG_6824.PNG | F031 | no se procesa | | bloqueada | | Duplicada de F030 |
| IMG_6831.PNG | F032 | espacios-parque-mesas-pileta-atardecer-01 | home.empresas, espacios.parque | provisoria-resolucion | 106 KB | pendientes: resolucion. Parque con montaje |
| IMG_7131.PNG | F033 | recorrido-1-parque-guirnaldas-tarde-01 | story.llegada | provisoria-rostros | 113 KB | pendientes: rostros, resolucion. Luz de transición Con el encuadre mobile se reconocen rostros; verificar permisos y menores. AVIF a calidad 45 para entrar en 120 KB. |
| IMG_7132.PNG | F034 | cierre-noche-mesa-cartel-noche-01 | reserva (sin ranura, no se genera) | provisoria-procedencia | no generada | pendientes: procedencia, resolucion. Reserva: sin ranura, no se genera. Cartel con tipografía irregular: verificar si es real |
| IMG_7151.PNG | F035 | casamientos-galeria-parque-guirnaldas-atardecer-01 | lluvia.sol, casamientos.parque, contacto.hero | provisoria-resolucion | 120 KB | pendientes: resolucion. Sirve para OG y hero |
| IMG_7155.PNG | F036 | no se procesa | | bloqueada | | Aparece un menor |
| IMG_7158.PNG | F037 | espacios-cubierto-galpon-mesa-larga-noche-01 | lluvia.cubierto, espacios.cubierto | provisoria-resolucion | 100 KB | pendientes: resolucion. Armado cubierto real |
| IMG_7159.PNG | F038 | espacios-cubierto-galpon-mesa-invitados-noche-01 | reserva (sin ranura, no se genera) | provisoria-rostros | no generada | pendientes: rostros, resolucion. Reserva: sin ranura, no se genera. Armado cubierto Verificar que no haya menores. |
| IMG_7188.PNG | F039 | cierre-noche-arbol-luces-pareja-noche-01 | reserva (sin ranura, no se genera) | provisoria-rostros | no generada | pendientes: rostros, resolucion. Reserva: sin ranura, no se genera. Rostros en primer plano Verificar que no haya menores. |
| IMG_7208.PNG | F040 | no se procesa | | bloqueada | | Rostros en primer plano |
| IMG_7210.PNG | F041 | casamientos-galeria-mesa-velas-noche-01 | hero.secundaria | provisoria-resolucion | 79 KB | pendientes: resolucion. Detalle limpio |
| IMG_7211.PNG | F042 | no se procesa | | bloqueada | | Rostros |
| IMG_7216.PNG | F043 | inicio-hero-parque-guirnaldas-atardecer-01 | hero.principal | provisoria-resolucion | 99 KB | pendientes: resolucion. Mejor candidata de hero |
| IMG_7235.PNG | F044 | recorrido-4-fogata-noche-01 | reserva (sin ranura, no se genera) | provisoria-resolucion | no generada | pendientes: resolucion. Reserva: sin ranura, no se genera. Sólo como alternativa |
| IMG_7237.PNG | F045 | espacios-cubierto-galpon-mesa-velas-noche-01 | casamientos.lluvia | provisoria-resolucion | 98 KB | pendientes: resolucion. Armado cubierto |
| IMG_7280.PNG | F046 | recorrido-2-palmera-guirnaldas-atardecer-01 | story.ceremonia | provisoria-procedencia | 45 KB | pendientes: procedencia, resolucion. Encuadre 7:4 que deja fuera a las personas del borde inferior. Recortar para dejar sólo cielo y luces |
| IMG_7284.PNG | F047 | casamientos-galeria-barra-madera-noche-01 | casamientos.servicios | provisoria-resolucion | 91 KB | pendientes: resolucion. Servicios |
| IMG_7592.PNG | F048 | recorrido-4-mesa-galpon-atardecer-01 | story.noche | provisoria-procedencia | 107 KB | pendientes: procedencia, resolucion. Muestra el frente del galpón AVIF a calidad 35 para entrar en 120 KB. |
| IMG_8519.PNG | F049 | recorrido-3-livings-arbol-luces-noche-01 | story.fiesta | provisoria-rostros | 102 KB | pendientes: rostros, resolucion. Confirmar rostros Verificar que no haya menores. AVIF a calidad 40 para entrar en 120 KB. |
| IMG_8920.PNG | F050 | no se procesa | | bloqueada | | Captura de video |
| IMG_8960.PNG | F051 | no se procesa | | bloqueada | | Procesado en exceso |
| IMG_9689.PNG | F052 | cierre-noche-barra-cartel-noche-01 | espacios.llegada | provisoria-procedencia | 91 KB | pendientes: procedencia, resolucion. Reconocible |
| IMG_9754.PNG | F053 | no se procesa | | bloqueada | | Captura de video |
| IMG_9799.PNG | F054 | no se procesa | | bloqueada | | Captura de video |
| IMG_9809.PNG | F055 | no se procesa | | bloqueada | | Duplicada de F002 |
| IMG_9954.PNG | F056 | no se procesa | | bloqueada | | Pedir original; F001 es otra versión |
| IMG_9974.HEIC | F057 | casamientos-hero-pasillo-flores-atardecer-01 | casamientos.hero, espacios.ceremonia | ok | 188 KB | pendientes: ninguno. Único original en alta resolución, sin rostros nítidos |
| IMG_9978.HEIC | F058 | no se procesa | | bloqueada | | Duplicada de F057 |
| d404fae6-7bc9-4ba8-89d3-693d93cc062f.jpg | F059 | no se procesa | | bloqueada | | Misma escena que F046, peor resolución |
| IMG_7151.PNG | F035 | og-parque-guirnaldas-atardecer-01 | og.default | provisoria-resolucion | JPEG 159 KB | Open Graph 1200×630 |

## Bloqueadas y por qué

- **F002** (16bc0bfd-4f38-43cd-83b2-5c89dd4f5c13.jpg): Duplicado de F055
- **F006** (5119907c-8e3c-4253-aecd-567acd5776fc.jpg): Igual a F018 (hash 0), peor resolución
- **F008** (7677FBD4-AEF2-4520-A4D3-933AA46763F1.png): Misma escena que F002/F055
- **F010** (97890C8B-3CB8-473A-B8ED-F78086E04564.png): Rostros, baja resolución
- **F012** (CE4E8F14-41D1-446A-A45B-94919031E098.png): Casi duplicada de F005
- **F013** (E4B1F96B-5609-4FFF-85C0-794C1D985935.png): Casi duplicada de F007
- **F014** (IMG_0024.PNG): Captura con interfaz y nombre de cuenta, música de terceros
- **F017** (IMG_0585.PNG): Marcos negros, posible menor
- **F019** (IMG_1782.PNG): Rostros, ruido
- **F020** (IMG_4483.PNG): Se ven menores (un bebé en brazos y un niño entre los invitados) y hay una mancha de retoque en el borde derecho
- **F022** (IMG_5256.PNG): Sobresaturada, baja resolución
- **F024** (IMG_5920.PNG): Captura de video
- **F025** (IMG_6599.PNG): Par de F021, rostros
- **F030** (IMG_6823.PNG): Luces de color poco coherentes; duplicada de F031
- **F031** (IMG_6824.PNG): Duplicada de F030
- **F036** (IMG_7155.PNG): Aparece un menor
- **F040** (IMG_7208.PNG): Rostros en primer plano
- **F042** (IMG_7211.PNG): Rostros
- **F050** (IMG_8920.PNG): Captura de video
- **F051** (IMG_8960.PNG): Procesado en exceso
- **F053** (IMG_9754.PNG): Captura de video
- **F054** (IMG_9799.PNG): Captura de video
- **F055** (IMG_9809.PNG): Duplicada de F002
- **F056** (IMG_9954.PNG): Pedir original; F001 es otra versión
- **F058** (IMG_9978.HEIC): Duplicada de F057
- **F059** (d404fae6-7bc9-4ba8-89d3-693d93cc062f.jpg): Misma escena que F046, peor resolución

F020 pasó de «a confirmar» a bloqueada al revisar el recorte: se ve un bebé en brazos y un niño entre los invitados, y tiene una mancha de retoque en el borde derecho.

## Ranuras

| Ranura | Foto | Estado | Para producción |
|---|---|---|---|
| hero.principal | F043 | provisoria-resolucion | no |
| hero.secundaria | F041 | provisoria-resolucion | no |
| story.llegada | F033 | provisoria-rostros | no |
| story.ceremonia | F046 | provisoria-procedencia | no |
| story.fiesta | F049 | provisoria-rostros | no |
| story.noche | F048 | provisoria-procedencia | no |
| lluvia.sol | F035 | provisoria-resolucion | no |
| lluvia.cubierto | F037 | provisoria-resolucion | no |
| home.casamientos | F028 | provisoria-resolucion | no |
| home.empresas | F032 | provisoria-resolucion | no |
| casamientos.hero | F057 | ok | sí |
| casamientos.parque | F035 | provisoria-resolucion | no |
| casamientos.servicios | F047 | provisoria-resolucion | no |
| casamientos.lluvia | F045 | provisoria-resolucion | no |
| espacios.hero | F027 | provisoria-resolucion | no |
| espacios.parque | F032 | provisoria-resolucion | no |
| espacios.cubierto | F037 | provisoria-resolucion | no |
| espacios.ceremonia | F057 | ok | sí |
| espacios.llegada | F052 | provisoria-procedencia | no |
| contacto.hero | F035 | provisoria-resolucion | no |
| contacto.entrada | F015 | provisoria-procedencia | no |

Siguen con la foto provisoria del sitio actual (`temp`): casamientos.ceremonia (la foto candidata tenía menores) y las ranuras de páginas que todavía no existen (Eventos de empresa, Eventos reales, Preguntas frecuentes) o que no se usan: home.hero, home.espacios, home.lluvia, home.visita, casamientos.interior, espacios.banos, equipo, reales.1 a reales.9. `lluvia.cubierto` sigue `pending`: el armado cubierto de F037 es de noche; se necesita uno de día o con lluvia.

## Lighthouse (mediana, mobile)

Última medición, al sacar WebP y las fotos de reserva (5 corridas; Casamientos y Espacios repetidas con 7):

| Página | Antes | Después |
|---|---|---|
| Inicio | perf 90, LCP 2,13 s, TBT 372 ms, CLS 0 | perf 91, LCP 2,13 s, TBT 341 ms, CLS 0 |
| Casamientos | perf 97, LCP 2,26 s, TBT 133 ms, CLS 0 | perf 95, LCP 2,27 s, TBT 227 ms, CLS 0 |
| Espacios | perf 95, LCP 2,12 s, TBT 223 ms, CLS 0 | perf 97, LCP 2,12 s, TBT 153 ms, CLS 0 |

Accesibilidad 100 en todas. El LCP y el CLS no cambian; el TBT y el perf varían entre corridas con la máquina (hubo corridas sueltas de 70 a 75 y una fallida) y el cambio no toca JavaScript. Mediciones anteriores, con todas las fotos nuevas: Inicio perf 97 y Casamientos perf 98.

## Revisión visual

Las hojas `docs/fotos/contactos/recortes-01.jpg` a `recortes-04.jpg` muestran cada ranura recortada en desktop (izquierda) y mobile (derecha), con el encuadre que hace el sitio. No se commitean porque tienen rostros. Además se revisaron a pantalla completa (1280 y 1440 px de ancho, y mobile de 390 px) las cuatro escenas del recorrido, el hero de Espacios y el de Contacto.

Correcciones hechas en esa revisión:

- `espacios.llegada`: F026 tiene el cartel luminoso tapado por una planta en el propio original, así que ninguna reencuadre lo muestra entero. Pasó a F052, donde se lee «LOS GALPONES» completo (queda `provisoria-procedencia`). F026 queda de reserva.
- Recorrido: se ajustó el punto focal de cada escena para que desktop no corte la escena justo donde cae el panel de texto.
- `story.llegada` (F033): con el encuadre mobile se reconocen rostros; pasó a `provisoria-rostros`.
- `story.ceremonia` (F046): se cambió el recorte a 7:4 para dejar fuera a las personas del borde inferior (se veían de cerca). En mobile queda el cielo con la palmera y no se ven las luces; en desktop se ven las guirnaldas abajo.
- Hero de Espacios (F027) y de Contacto (F035): sin rostros reconocibles ni cortes; no hizo falta cambiar nada.

## Qué hay que pedirle al cliente (actualizado)

- **Los originales** de todas las fotos, sin captura ni retoque (mínimo 2500 px de lado largo). Es lo que destraba el estado `provisoria-resolucion`, hoy en la mayoría.
- **Procedencia**: confirmar si F001, F003, F004, F005, F007, F009, F011, F034 y F052 son fotos reales del lugar, y de dónde salen F015, F018, F021, F023, F046 y F048 (sin datos de cámara).
- **Permisos de las personas** que se ven en F007, F015, F016, F018, F021, F029, F033, F038, F039 y F049, y confirmar que no aparezcan menores.
- **Armado cubierto con mesas puestas, con luz natural** (de día o con lluvia) para el interruptor Sol/Lluvia.
- **Fachada y acceso** de día y sin gente (hoy `contacto.entrada` usa F015, con gente).
- **Una foto de ceremonia sin menores** para casamientos.ceremonia (F020 quedó bloqueada).
- **Eventos de empresa y eventos reales** con permiso e identificados (tipo y fecha).
- Nombre del fotógrafo, si lo hay, para los créditos del footer. No se inventó ninguno.
