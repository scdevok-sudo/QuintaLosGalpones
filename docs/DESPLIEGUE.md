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
