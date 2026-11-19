# Despliegue en el VPS (OpenLiteSpeed)

Este documento es la guía para publicar `dist/` y volver atrás. **No se publicó nada todavía.** Los datos del servidor (usuario, ruta, dominio de preview) no están en el repo: donde dice `COMPLETAR` hay que poner el dato real antes de la primera vez.

## 1. Qué se publica

`npm run build` deja `dist/`: un HTML plano por página (`casamientos.html`, `contacto.html`, ...), `index.html`, `404.html`, `assets/` (con hash), `photos/`, `og/`, `brand/`, `robots.txt`, `.htaccess` y, si es indexable, `sitemap.xml`. Es contenido 100 % estático: no hace falta Node en el servidor.

## 2. Variables de entorno (se leen al construir, no en el servidor)

| Variable | Preview | Producción |
|---|---|---|
| `VITE_SITE_URL` | URL del preview | `https://quintalosgalpones.com` (confirmar con o sin `www`) |
| `VITE_NOINDEX` | `true` | `false` |
| `VITE_FORM_ENDPOINT` | URL `/exec` del Apps Script (ver `apps-script/README.md`) | la misma |
| `VITE_GA_ID` | vacío | `G-XXXXXXXXXX` cuando el cliente lo pase |
| `VITE_PREVIEW_PENDING` | opcional | **no definir** (oculta piezas que esperan foto real) |

Se definen en `.env.local` (no se versiona) o como variables del entorno donde se construya.

## 3. Pasar de preview a producción: lista de control

1. `npm run check`, `npm run check:launch` y revisar que lo que liste dependa solo del cliente.
2. Decidir con el cliente qué queda visible: `realesVisible` (`src/content/reales.ts`), `site.presupuestoBloque.validated`, `site.whatsapp.validated`, `site.privacyReviewed.validated`.
3. Construir con `VITE_NOINDEX=false` y `VITE_SITE_URL` real: `VITE_NOINDEX=false npm run build`. Verificar `dist/robots.txt` (`Allow: /` y `Sitemap:`) y que exista `dist/sitemap.xml`.
4. Probar en local: `npm run preview` y `npm run check:routes`, `check:nojs`, `check:panel`.
5. Subir (sección 4), repetir `BASE_URL=https://dominio npm run check:routes` contra el servidor real (es lo único que falta probar en OpenLiteSpeed).
6. Enviar `sitemap.xml` a Google Search Console, verificar el dominio y revisar la cobertura.
7. Recién entonces cambiar el DNS o el vhost del dominio (esto lo hace Santi, no el repo).

## 4. Subir al VPS

Mismo método para preview y producción. Se sube a una carpeta nueva con fecha y un enlace simbólico `current` apunta a la versión activa: así el rollback es cambiar un enlace.

```bash
# 1) construir
npm run build

# 2) subir a una carpeta con fecha (COMPLETAR usuario, host y ruta)
STAMP=$(date +%Y%m%d-%H%M)
rsync -avz --delete dist/ USUARIO@HOST:/RUTA/quinta/releases/$STAMP/

# 3) activar: el vhost apunta a /RUTA/quinta/current
ssh USUARIO@HOST "ln -sfn /RUTA/quinta/releases/$STAMP /RUTA/quinta/current"
```

Si el servidor no permite enlaces simbólicos, subir directo a la carpeta del sitio con `rsync --delete` y conservar el release anterior comprimido (`tar czf`) antes de pisar.

## 5. OpenLiteSpeed

Reglas, caché y compresión: ver `README.md` (sección "URLs: forma canónica sin barra final") y `public/.htaccess`, que ya trae también el mapa de redirecciones del WordPress anterior. Resumen:

- *Rewrite*: activar **Enable Rewrite** y **Auto Load from .htaccess** (con `Allow Override`), o pegar las reglas en el vhost.
- Caché: `/assets/` y `/photos/` con `Cache-Control: public, max-age=31536000, immutable` (los nombres llevan hash o ancho); los `.html` con `no-cache`.
- Compresión gzip/brotli de texto activa.
- Cloudflare (si está delante): modo SSL *Full (strict)*; regla de caché "Cache Everything" solo para `/assets/*`, `/photos/*` y `/og/*`; **no** cachear los `.html` hasta definir la purga. Después de cada publicación hacer *Purge Everything* o purgar por URL las páginas que cambiaron.
- 404: `ErrorDocument 404 /404.html` (ya está en `.htaccess`); debe responder estado 404 real, no 200.

## 6. Redirecciones desde el WordPress anterior

Mapa en `scripts/redirects.mjs` (fuente única para el preview y `check:routes`) y en `public/.htaccess` (producción). Cubre `hello-world`, feeds, `wp-sitemap*.xml`, `category/author/tag`, `?p=`, `?page_id=`, `?s=` (301 a `/`) y `wp-admin`, `wp-login.php`, `wp-content`, `wp-includes`, `wp-json`, `xmlrpc.php` (410).

Fuente: el sitemap público del sitio viejo solo lista `/` y `/hello-world/`. **Hay que pedir:**

- Al hosting: el log de accesos de los últimos 3 a 6 meses, para ver qué URLs viejas reciben visitas (en especial imágenes de `wp-content/uploads` enlazadas desde Instagram o Google).
- Al cliente: si hay otras páginas, PDF o enlaces que haya compartido (por ejemplo desde Instagram) que deban seguir funcionando.
- A Search Console del dominio actual (si existe): el informe de páginas indexadas.

Plantilla para sumar una URL vieja que tiene equivalente nuevo (agregar en **los dos** archivos):

```apache
RewriteRule ^url-vieja/?$ /eventos-empresariales [R=301,L]
```

```js
{ from: /^\/url-vieja\/?$/, to: "/eventos-empresariales", status: 301 },
```

## 7. Rollback

- Con enlace `current`: `ssh USUARIO@HOST "ln -sfn /RUTA/quinta/releases/ANTERIOR /RUTA/quinta/current"` y purgar Cloudflare. Tarda segundos y no depende de git.
- Si hay que volver al WordPress: devolver el vhost/DNS al estado anterior (anotar el valor original antes de cambiarlo) y dejar el `noindex` si el sitio nuevo ya se había indexado.
- Código: cada versión publicada queda con su commit; anotar en `releases/STAMP/VERSION.txt` el hash (`git rev-parse --short HEAD`) al subir.

## 8. Después de publicar

- `BASE_URL=https://dominio npm run check:routes`.
- Enviar una consulta de prueba por el formulario y por el panel: tiene que llegar el aviso y la autorrespuesta.
- Abrir el sitio con `?` desde Instagram y WhatsApp para ver la vista previa (Open Graph).
- Medir con PageSpeed Insights (móvil) Inicio, Casamientos y Contacto.
- Si se activó GA4: verificar en tiempo real que llegan `click_whatsapp`, `express_abierto` y `contacto_envio`.

## 9. Preview en Vercel (plan Hobby)
Solo para mostrarle el sitio al cliente, con noindex. **No es producción**: el plan Hobby de Vercel es para uso personal y no comercial, y este sitio es de un negocio. La producción sigue siendo el VPS (secciones 1 a 8).

**Qué hace Vercel.** `vercel.json` fija `framework: null` (sitio estático, sin funciones), `installCommand: npm ci`, `buildCommand: npm run build` y `outputDirectory: dist`. El build es `react-router build && node scripts/postbuild.mjs`: **no** corre `photos:build` ni usa los originales (están en `.gitignore`); trabaja con lo commiteado en `public/photos` y `src/data/*.json`. La salida está en `dist/` (no en `build/client`: `postbuild` aplana cada ruta a `<ruta>.html`, agrega `robots.txt` y, si corresponde, `sitemap.xml`). Probado clonando el repo en una carpeta limpia (`npm ci && npm run build`, sin `.env.local`): compila, 8 rutas prerenderizadas más `404.html`. `vercel.json` reemplaza al preset de la importación: no hace falta tocar nada en el panel.

**Variables de entorno** (Project Settings, Environment Variables; se leen al construir, hay que redeployar para cambiarlas):

| Variable | Valor en el preview |
|---|---|
| `VITE_SITE_URL` | la URL `https://<proyecto>.vercel.app`, sin barra final. Si falta, canonical, og:url, og:image y JSON-LD apuntan a `https://quintalosgalpones.com` |
| `VITE_NOINDEX` | `true`: `<meta name="robots" content="noindex, nofollow">`, `robots.txt` con `Disallow: /` y sin `sitemap.xml` |
| `VITE_FORM_ENDPOINT` | vacía: el formulario muestra "No pudimos enviar la consulta..." con el botón de WhatsApp |
| `VITE_GA_ID` | vacía: no se carga `gtag.js` ni se pide nada a Google |
| `VITE_PREVIEW_PENDING` | `true`: muestra el interruptor Sol/Lluvia con la foto provisoria |

**Qué cambiar para pasar a producción en el VPS** (en el entorno donde se construye, no en Vercel): `VITE_SITE_URL` con el dominio real; `VITE_NOINDEX=false`; quitar `VITE_PREVIEW_PENDING`; `VITE_FORM_ENDPOINT` con el Apps Script desplegado; `VITE_GA_ID` si se usa GA4; y resolver lo que lista `npm run check:launch`. `vercel.json` no se usa en el VPS; allí rigen `public/.htaccess` o el vhost (secciones 5 y 6), que no se tocaron.

**Compartir el link**: la imagen de vista previa (`/og/*.jpg`, 1200x630) lleva el logo abajo a la izquierda; se regenera con `npm run og:build`. WhatsApp y otras redes la guardan en caché: si se cambia, usar el depurador de la red o agregar `?v=2` al link.

**Diferencias con el VPS (conviene saberlas)**
- `/ruta/` redirige a `/ruta` con 308 (Vercel), no 301 como `.htaccess`. `check:routes` espera 301: contra Vercel esas líneas marcarán MAL aunque funcione.
- Los artefactos de WordPress `wp-admin`, `wp-login.php`, `wp-content`, `wp-includes`, `wp-json` y `xmlrpc.php` devuelven el 404 propio, no 410 (Vercel no permite 410 en `vercel.json`).
- No se replica la regla de `.htaccess` para consultas viejas de WordPress en la portada (`/?p=12`): no hay forma segura de quitar la query sin riesgo de bucle de redirección y no aporta en un preview.
- `vercel.json` agrega `X-Robots-Tag: noindex, nofollow` a todo (también a las fotos, para que no entren a Google Imágenes) y caché inmutable de un año en `/assets/*` y `/photos/*`. Los nombres de `/photos/*` no llevan hash: si `photos:build` regenera una foto con el mismo nombre y distinto contenido, los navegadores que ya la tienen no la vuelven a pedir hasta que pase el año. Para el preview alcanza con un cambio de nombre o `?v=`; para producción conviene versionar los nombres.

**Qué NO valida este preview**: las reglas de `public/.htaccess` (rewrites, 301, `ErrorDocument`), el vhost de OpenLiteSpeed (sección 5), la compresión y el caché reales del VPS ni los redirects del WordPress viejo tal como los resuelve ese servidor. Esas pruebas se hacen en el VPS con `BASE_URL=https://dominio npm run check:routes`.
