import type { Meta } from "./types";

/**
 * Borrador de política de privacidad. NO tiene validación legal: lo escribimos nosotros a partir de lo que el sitio
 * hace hoy (Ley 25.326 de Protección de Datos Personales). El aviso de borrador se muestra mientras
 * `site.privacyReviewed.validated` sea false. Todo el texto está en docs/COPY-CAMBIOS.md.
 */
export const meta: Meta = {
  path: "/politica-de-privacidad",
  title: "Política de privacidad | Quinta Los Galpones",
  description: "Qué datos pedimos en el sitio de Quinta Los Galpones, para qué los usamos y cómo podés acceder a ellos, corregirlos o pedir que los borremos.",
};

export const h1 = "Política de privacidad";

export const borrador =
  "Este texto es un borrador y todavía no pasó por una revisión legal. Puede cambiar antes de que el sitio se publique.";

export const intro =
  "Acá te contamos qué datos tuyos recibimos cuando usás este sitio, para qué los usamos y qué podés hacer con ellos. Intentamos escribirlo sin vueltas.";

export const sections: { id: string; h2: string; body: string[] }[] = [
  {
    id: "quien",
    h2: "Quién se ocupa de tus datos",
    body: [
      "Quinta Los Galpones, con domicilio en Quintino Bocayuva 655, Benavídez, provincia de Buenos Aires, es quien recibe y trata los datos que nos enviás por este sitio.",
    ],
  },
  {
    id: "datos",
    h2: "Qué datos pedimos",
    body: [
      "Cuando pedís una propuesta, por el formulario de Contacto o por el panel de consulta, te pedimos tu nombre y al menos un medio para responderte: correo o WhatsApp. Además podés contarnos el tipo de evento, el nombre de tu organización si es un evento de empresa, la fecha estimada, una cantidad aproximada de invitados y un mensaje.",
      "Nada de eso es obligatorio salvo el nombre y un medio de contacto. No te pedimos documentos, datos de pago ni datos sensibles. Si los escribís en el mensaje, no los vamos a usar para otra cosa que responderte.",
      "Si en cambio elegís seguir por WhatsApp, el sitio abre el chat con un mensaje armado con lo que elegiste. Ese mensaje lo enviás vos, desde tu aplicación, y no pasa por este sitio.",
    ],
  },
  {
    id: "para-que",
    h2: "Para qué los usamos",
    body: [
      "Usamos tus datos para responder tu consulta, enviarte una propuesta y coordinar una visita. Cuando enviás el formulario te llega un correo con el resumen de lo que cargaste.",
      "No los usamos para enviarte publicidad ni los vendemos o cedemos a terceros con fines comerciales.",
    ],
  },
  {
    id: "donde",
    h2: "Dónde se guardan",
    body: [
      "Las consultas se guardan en una planilla de Google y llegan por correo a quienes atienden la quinta. Google actúa como proveedor del servicio y puede alojar esa información en servidores fuera de la Argentina.",
      "Conservamos la consulta mientras dure la conversación y por un tiempo razonable después, para poder retomarla. Si querés que la borremos antes, escribinos.",
    ],
  },
  {
    id: "derechos",
    h2: "Tus derechos",
    body: [
      "La Ley 25.326 te da derecho a acceder a tus datos, a pedir que los corrijamos, los actualicemos o los suprimamos. Podés pedirlo cuando quieras escribiéndonos por los medios de la sección de contacto, y lo atendemos sin costo.",
      "Si sentís que no atendimos bien tu pedido, podés presentar un reclamo ante la Agencia de Acceso a la Información Pública, que es el organismo de control de la ley.",
    ],
  },
  {
    id: "cookies",
    h2: "Cookies y servicios de terceros",
    body: [
      "Este sitio no usa cookies propias para seguirte ni para publicidad. Las fuentes y las imágenes se cargan desde el mismo sitio.",
      "El mapa de Google solo se carga cuando tocás el botón para ver el mapa. Recién ahí Google puede guardar cookies en tu navegador, según su propia política.",
      "Si el sitio activa Google Analytics para medir cuántas personas lo visitan y qué botones usan, Google puede guardar cookies de medición. En ese caso lo avisamos acá y en el sitio, y podés bloquearlas desde la configuración de tu navegador.",
      "Los enlaces a WhatsApp e Instagram te llevan a esos servicios, que tienen sus propias políticas.",
    ],
  },
  {
    id: "contacto",
    h2: "Cómo contactarnos por tus datos",
    body: [
      "Escribinos por WhatsApp o por el formulario de Contacto y aclará que es un pedido sobre tus datos. Vamos a sumar un correo de contacto cuando esté confirmado.",
    ],
  },
  {
    id: "cambios",
    h2: "Cambios en esta política",
    body: ["Si cambiamos algo importante, actualizamos esta página y la fecha de abajo."],
  },
];

export const actualizado = "Última actualización: noviembre de 2026 (borrador).";
