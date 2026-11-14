# Quinta Los Galpones

Sitio estático (React Router en modo SPA con prerenderizado) para casamientos y eventos de empresa en Benavídez.
El resultado de `npm run build` es la carpeta `dist/`, lista para subir a un hosting estático (OpenLiteSpeed).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila y deja `dist/` (HTML plano por página, `robots.txt`, `sitemap.xml`) |
| `npm run preview` | Sirve `dist/` con las mismas reglas de rewrite que producción y gzip (puerto 4173) |
| `npm run check` | `check:content`, `check:tells` y `test:tells` |
| `npm run check:routes` | URLs con y sin barra, canonical y sitemap (necesita `npm run preview`) |
| `npm run check:nojs` / `check:panel` | CTA sin JS y panel de consulta en pantallas bajas |
| `npm run check:launch` | Lista lo que falta antes de publicar |

## URLs: forma canónica sin barra final

Cada página se publica como un archivo plano (`dist/casamientos.html`, no `dist/casamientos/index.html`) y la URL
canónica no lleva barra final: `/casamientos`. La portada es `/`.

Un servidor tipo Apache/OpenLiteSpeed redirige por defecto `/casamientos` a `/casamientos/` cuando existe una carpeta con
ese nombre (DirectorySlash). Como no hay carpetas por página, hace falta una regla de rewrite que haga lo contrario:

1. `/ruta/` responde **301** a `/ruta`.
2. `/ruta` se sirve desde `ruta.html`.
3. Lo que no existe responde 404 real con `404.html`.

El archivo `public/.htaccess` ya trae las reglas y se copia a `dist/`:

```apache
RewriteEngine On
RewriteRule ^(.+)/$ /$1 [R=301,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^(.+)$ /$1.html [L]
ErrorDocument 404 /404.html
```

**OpenLiteSpeed.** Hay dos formas:

- Con `.htaccess`: en *Virtual Hosts > (el sitio) > Rewrite* activar **Enable Rewrite** y **Auto Load from .htaccess**
  (en el servidor, `Allow Override` habilitado). Con eso alcanza.
- En el vhost (más rápido, no depende de `.htaccess`): *Rewrite > Enable Rewrite = Yes* y pegar en *Rewrite Rules*:

```
RewriteRule ^/(.+)/$ /$1 [R=301,L]
RewriteCond %{DOCUMENT_ROOT}/$1.html -f
RewriteRule ^/(.+)$ /$1.html [L]
```

En *Context* conviene agregar `Cache-Control: public, max-age=31536000, immutable` para `/assets/` (los archivos llevan hash)
y `no-cache` para los `.html`. Activar la compresión gzip/brotli de texto.

`npm run preview` implementa estas mismas reglas (y gzip) para probar en local; `npm run check:routes` las verifica.
**Verificado con el servidor de preview, no con un OpenLiteSpeed real:** después del primer deploy hay que repetir
`BASE_URL=https://tu-dominio npm run check:routes`.

El canonical, `og:url` y el `sitemap.xml` usan la forma sin barra (`https://quintalosgalpones.com/casamientos`).

## Variables de entorno

Ver `.env.example`: `VITE_SITE_URL` (sin barra final), `VITE_NOINDEX` (true en preview), `VITE_FORM_ENDPOINT`, `VITE_GA_ID`.

## Rendimiento

El JS se difiere: `scripts/postbuild.mjs` reemplaza el script de módulo por un cargador que espera el LCP, precarga el
módulo de React Router con `pointerdown`/`touchstart`/`focus` sobre un CTA e hidrata en `requestIdleCallback` (tope 2 s).
El panel de consulta es un popover prerenderizado: abre sin hidratar.
La foto principal de cada página se precarga desde el `<head>` (`src/lib/lcp.ts`) y el resto de las fotos de la página
esperan a la hidratación (`<Photo later>`).
