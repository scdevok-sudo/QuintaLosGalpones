/**
 * Quinta Los Galpones: receptor de consultas del sitio (Google Apps Script).
 *
 * Qué hace cada consulta que llega por POST (text/plain con un JSON):
 *   1. Valida (nombre y al menos un medio de contacto) y descarta bots (honeypot y tiempo mínimo, también acá).
 *   2. Agrega una fila a la planilla.
 *   3. Envía un aviso por correo a NOTIFY_EMAIL, con replyTo al correo de quien consultó (si lo dejó).
 *   4. Si dejó correo, le manda una autorrespuesta con el texto de confirmación del documento y el resumen de lo
 *      que cargó. Sin promesa de plazo de respuesta.
 *
 * Configuración: Propiedades del script (Configuración del proyecto > Propiedades del script). Ver README.md.
 *   NOTIFY_EMAIL   obligatoria. Correo que recibe los avisos (el del cliente, con dominio propio cuando exista).
 *   SHEET_ID       opcional. ID de la planilla. Si falta, usa la planilla a la que está vinculado el script.
 *   SENDER_NAME    opcional. Nombre del remitente. Por defecto "Quinta Los Galpones".
 *   REPLY_TO       opcional. Correo al que responde quien recibe la autorrespuesta. Por defecto NOTIFY_EMAIL.
 *   ALLOWED_ORIGIN opcional. Si se define, se rechazan consultas cuyo campo "pagina" no sea un camino del sitio.
 */

var MIN_MS = 2500;
var HONEYPOT = "sitio_web";
var SHEET_NAME = "Consultas";
var A_DEFINIR = "A definir";
var CONFIRMACION = "Recibimos tu mensaje. Te vamos a responder por el medio que indicaste.";

var COLUMNAS = [
  "Fecha de envío",
  "Tipo",
  "Nombre",
  "Organización",
  "Correo",
  "WhatsApp",
  "Fecha del evento",
  "Rango de invitados",
  "Ambiente",
  "Mensaje",
  "Página de origen",
];

var TIPOS = { casamiento: "Casamiento", empresa: "Evento de empresa", otro: "Otro evento" };
var RANGOS = { "": A_DEFINIR, "hasta-100": "Hasta 100", "100-200": "De 100 a 200", "mas-200": "Más de 200" };
var AMBIENTES = { "": A_DEFINIR, "aire-libre": "Al aire libre", cubierto: "Espacio cubierto", ambos: "Los dos" };

function doGet() {
  return json_({ ok: true, servicio: "Consultas de Quinta Los Galpones" });
}

function doPost(e) {
  var datos;
  try {
    datos = JSON.parse(e && e.postData && e.postData.contents ? e.postData.contents : "{}");
  } catch (err) {
    return json_({ ok: false, error: "formato" });
  }

  // Antispam: se responde ok para no darle pistas a un bot, pero no se guarda nada.
  if (datos[HONEYPOT] || Number(datos.ms) < MIN_MS) return json_({ ok: true });

  var c = limpiar_(datos);
  if (!c.nombre) return json_({ ok: false, error: "nombre" });
  if (!c.correo && !c.whatsapp) return json_({ ok: false, error: "contacto" });
  if (c.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.correo)) return json_({ ok: false, error: "correo" });

  // Freno simple: la misma persona no puede enviar más de una consulta por minuto.
  var cache = CacheService.getScriptCache();
  var clave = "c:" + (c.correo || c.whatsapp).toLowerCase();
  if (cache.get(clave)) return json_({ ok: true });
  cache.put(clave, "1", 60);

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var hoja = hoja_();
    hoja.appendRow([
      new Date(),
      c.tipoTxt,
      c.nombre,
      c.organizacion,
      c.correo,
      c.whatsapp,
      c.fecha,
      c.invitadosTxt,
      c.ambienteTxt,
      c.mensajeCompleto,
      c.pagina,
    ]);
  } finally {
    lock.releaseLock();
  }

  try {
    avisar_(c);
    if (c.correo) autorresponder_(c);
  } catch (err) {
    // La consulta ya quedó en la planilla: un fallo de correo no se le muestra a quien consultó.
    console.error("correo: " + err);
  }
  return json_({ ok: true });
}

// ---------- helpers ----------

function props_() {
  return PropertiesService.getScriptProperties();
}

function hoja_() {
  var id = props_().getProperty("SHEET_ID");
  var libro = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(SHEET_NAME) || libro.insertSheet(SHEET_NAME);
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(COLUMNAS);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function texto_(v, max) {
  var s = String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  // Evita que una celda se interprete como fórmula en la planilla.
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.slice(0, max || 300);
}

function limpiar_(d) {
  var tipo = TIPOS[d.tipo] ? d.tipo : "otro";
  var c = {
    tipo: tipo,
    tipoTxt: TIPOS[tipo],
    nombre: texto_(d.nombre, 120),
    organizacion: texto_(d.organizacion, 160),
    correo: texto_(d.correo, 160),
    whatsapp: texto_(d.whatsapp, 40),
    fecha: texto_(d.fecha, 40) || A_DEFINIR,
    invitadosTxt: RANGOS[d.invitados] !== undefined ? RANGOS[d.invitados] : texto_(d.invitados, 40) || A_DEFINIR,
    ambienteTxt: AMBIENTES[d.ambiente] !== undefined ? AMBIENTES[d.ambiente] : A_DEFINIR,
    pareja: texto_(d.pareja, 160),
    ceremonia: texto_(d.ceremonia, 20),
    objetivo: texto_(d.objetivo, 300),
    mensaje: texto_(d.mensaje, 2000),
    pagina: texto_(d.pagina, 120),
  };
  // Los datos propios de cada tipo viajan dentro de la columna Mensaje para no ensanchar la planilla.
  var extra = [];
  if (c.pareja) extra.push("Pareja: " + c.pareja);
  if (c.ceremonia) extra.push("Ceremonia en la quinta: " + (c.ceremonia === "si" ? "Sí" : c.ceremonia === "no" ? "No" : A_DEFINIR));
  if (c.objetivo) extra.push("Objetivo: " + c.objetivo);
  c.mensajeCompleto = extra.concat(c.mensaje ? [c.mensaje] : []).join("\n") || A_DEFINIR;
  return c;
}

function resumen_(c) {
  var l = [
    "Tipo de evento: " + c.tipoTxt,
    "Nombre: " + c.nombre,
  ];
  if (c.organizacion) l.push("Organización: " + c.organizacion);
  if (c.correo) l.push("Correo: " + c.correo);
  if (c.whatsapp) l.push("WhatsApp: " + c.whatsapp);
  l.push("Fecha: " + c.fecha, "Invitados: " + c.invitadosTxt, "Ambiente: " + c.ambienteTxt);
  if (c.mensajeCompleto !== A_DEFINIR) l.push("Mensaje:\n" + c.mensajeCompleto);
  return l.join("\n");
}

function avisar_(c) {
  var para = props_().getProperty("NOTIFY_EMAIL");
  if (!para) throw new Error("Falta NOTIFY_EMAIL en las propiedades del script.");
  var opciones = { name: props_().getProperty("SENDER_NAME") || "Quinta Los Galpones" };
  if (c.correo) opciones.replyTo = c.correo;
  MailApp.sendEmail(
    para,
    "Nueva consulta: " + c.tipoTxt + " (" + c.nombre + ")",
    resumen_(c) + "\n\nPágina de origen: " + (c.pagina || "sin dato") + "\n\nPara responder, usá Responder: le escribís a quien consultó.",
    opciones
  );
}

function autorresponder_(c) {
  var nombre = props_().getProperty("SENDER_NAME") || "Quinta Los Galpones";
  var replyTo = props_().getProperty("REPLY_TO") || props_().getProperty("NOTIFY_EMAIL");
  var cuerpo =
    "Hola " + c.nombre + ",\n\n" +
    CONFIRMACION + "\n\n" +
    "Esto es lo que nos dejaste:\n\n" + resumen_(c) + "\n\n" +
    "Si querés agregar algo, respondé este correo.\n\n" +
    nombre;
  MailApp.sendEmail(c.correo, "Recibimos tu consulta", cuerpo, { name: nombre, replyTo: replyTo });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
