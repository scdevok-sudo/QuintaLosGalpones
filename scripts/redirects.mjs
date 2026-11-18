// Mapa de redirecciones desde el WordPress anterior. Fuente única para el servidor de preview y check:routes.
// Las mismas reglas están escritas a mano en public/.htaccess (y en el README para el vhost de OpenLiteSpeed):
// si cambia una, cambiar la otra.
// Fuente de las URLs viejas: wp-sitemap de quintalosgalpones.com (solo "/" y "/hello-world/") más los
// artefactos estándar de WordPress. Pendiente: pedirle al hosting el log de accesos para ver otras URLs.
export const redirects = [
  { from: /^\/hello-world\/?$/, to: "/", status: 301 },
  { from: /^\/(comments\/)?feed\/?$/, to: "/", status: 301 },
  { from: /^\/wp-sitemap[^/]*\.xml$/, to: "/", status: 301 },
  { from: /^\/(category|author|tag)(\/|$)/, to: "/", status: 301 },
  { from: /^\/(wp-admin|wp-login\.php|wp-content|wp-includes|wp-json|xmlrpc\.php)(\/|$)/, to: null, status: 410 },
];
/** Consultas viejas de WordPress (?p=12, ?page_id=3, ?s=algo) en la portada: 301 a "/" sin la query. */
export const oldQuery = /^\?(p|page_id|cat|s|feed)=/;
