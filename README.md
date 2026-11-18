# Quinta Los Galpones

Sitio estático (React Router en modo SPA con prerenderizado) para casamientos y eventos de empresa en Benavídez.
El resultado de `npm run build` es la carpeta `dist/`, lista para subir a un hosting estático (OpenLiteSpeed).

Cómo publicar, variables de entorno, redirecciones del WordPress y rollback: `docs/DESPLIEGUE.md`.
El formulario envía a un Google Apps Script: `apps-script/README.md`.

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

## Fotos

Las fotos del sitio salen de `photos.config.json` (qué foto va en qué ranura, recorte, punto focal, `alt`, permisos) y se
procesan con `npm run photos:build`. Por cada foto con ranura se generan AVIF a 640, 960 y hasta 1440 o 2000 px (nunca más
que el original) y **un solo JPEG de respaldo** a 1440 px (o al ancho del recorte si es menor), todo sin EXIF ni GPS. No se
genera WebP. El resultado va a `public/photos/` y `src/data/photos.manifest.json`. Los originales no se commitean
(`imagenes/` está en `.gitignore`).

Las fotos de **reserva** (están en `photos.config.json` pero ninguna ranura las usa) **no se generan**: aparecen en el
manifiesto con `generada: false` y se hacen cuando hacen falta, con `npm run photos:build -- F046`.

| Comando | Qué hace |
|---|---|
| `npm run photos:build` | Procesa las fotos que tienen ranura y regenera `public/photos/`, el manifiesto y `photos.slots.json` (unos 2 minutos). No hacer commit mientras corre: borra la carpeta y la vuelve a escribir |
| `npm run photos:build -- F046 F052` | Rehace solo esas fotos (aunque no tengan ranura) y deja el resto como está |
| `npm run photos:verify` | Falla si hay nombres fuera de patrón, metadatos, fotos agrandadas, `alt` o medidas faltantes, fotos fuera de presupuesto, una ranura con foto bloqueada o con una foto de reserva sin generar |
| `npm run check:launch` | Lista lo pendiente. Las fotos `provisoria-*` salen como "Pendiente de confirmación del cliente"; solo falla si una foto `bloqueada` está en uso |

### Agregar o cambiar una foto

**Cambiar el archivo de una foto** (por ejemplo, cuando llega el original en mejor resolución):

1. Copiá el original **con el mismo nombre de archivo** que figura en `original` dentro de `photos.config.json`
   (por ejemplo `IMG_7216.PNG`) en la carpeta que indica `fuente` (hoy `imagenes/Para Diego-1-001/Para Diego/`).
   Si el archivo nuevo tiene otro nombre, cambiá `original` en `photos.config.json` y dejá el resto igual.
   Formatos admitidos: JPG, PNG, WebP, AVIF y HEIC (los HEIC se convierten con `pillow-heif`).
2. `npm run photos:build -- F0xx` (el ID de esa foto), o `npm run photos:build` para todas.
3. `npm run photos:verify` y `npm run check:launch`, y mirá la foto en el navegador (`?slots=1` en dev muestra el nombre de la ranura).

**Poner una foto en otra ranura:** en `slots` de `photos.config.json`, cambiá `foto` por el ID que querés (por ejemplo
`"espacios.llegada": { "foto": "F052", ... }`). `desktop` y `mobile` son las proporciones del contenedor; `focal`
(`[x, y]` en %) mueve el encuadre dentro del recorte. Si esa foto era de reserva, generala:
`npm run photos:build -- F052`. Con `npm run photos:build` a secas también se genera, porque ahora tiene ranura.

**Agregar una foto nueva:** copiá el archivo a la carpeta `fuente`, sumá una entrada en `fotos` de
`photos.config.json` y asignala a una ranura en `slots`. Los campos que llevan las demás entradas:

| Campo | Para qué |
|---|---|
| `id` | `F0xx`, único. Solo se usa en la configuración; no aparece en los nombres de archivo |
| `original` | Nombre del archivo en la carpeta `fuente` |
| `procesar` | `true`; con `false` queda `bloqueada` y hay que escribir `motivo` |
| `seccion`, `sujeto`, `momento` | Forman el nombre: `{seccion}-{sujeto}-{momento}-{nn}`. Secciones válidas: `inicio-hero`, `recorrido-1` a `recorrido-4`, `casamientos-hero`, `casamientos-galeria`, `espacios-parque`, `espacios-galpon`, `espacios-cubierto`, `lluvia`, `mapa-fachada`, `og`, `cierre-noche`, `empresas`, `eventos-reales`. Momentos: `dia`, `tarde`, `atardecer`, `noche`, `interior` |
| `ratio` | Proporción del recorte maestro, la más alta que pida alguna ranura (ej. `[4, 3]`, `[4, 5]`) |
| `focal` | `{ "x": 0 a 1, "y": 0 a 1 }` sobre la foto original: el recorte se centra ahí |
| `trim` | Opcional: `[arriba, derecha, abajo, izquierda]` en px para sacar bordes negros |
| `alt` | Lo que se ve, sin adjetivos de marketing ni datos inventados |
| `personas` | `ninguna`, `sin-rostro`, `rostros-con-permiso` o `rostros-sin-confirmar` |
| `dudas` / `confirmado` | `{ "procedencia": bool, "rostros": bool }`: lo que hay que confirmar con el cliente y lo ya confirmado |

El estado se recalcula solo en cada build: si el lado largo del recorte llega a 2000 px, la foto deja de estar en
`provisoria-resolucion`. Cuando el cliente confirme la autoría o los permisos, poné
`"confirmado": { "procedencia": true, "rostros": true }` en esa foto; sin eso quedan como pendientes.

### Hero a sangre

Con fotos de 1320 px el hero va en un contenedor de ancho máximo (`.hero-frame`, 76 rem) y no se agranda. Cuando los
originales tengan 2000 px o más de lado largo, se activa la proporción a sangre (`bleed`, 21:9 en los slots que la
declaran en `photos.config.json`) con la variable:

```
VITE_HERO_BLEED=true
```

en `.env.local`, y se vuelve a compilar con `npm run build`. Sin la variable no cambia nada.

### Estados

- `ok`: lista para producción.
- `provisoria-resolucion`: menos de 2000 px de lado largo; no se agranda nunca.
- `provisoria-procedencia`: sin EXIF o con acabado de imagen retocada; hay que confirmar con el cliente que es una foto real del lugar.
- `provisoria-rostros`: hay personas reconocibles sin permiso confirmado.
- `bloqueada`: no se procesa ni se publica (menores, capturas de redes, marcos negros, derechos de terceros, duplicadas).
