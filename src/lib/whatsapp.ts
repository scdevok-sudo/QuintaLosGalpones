import { site } from "@/config/site";

export type WhatsappContext =
  | "generico"
  | "casamiento"
  | "casamiento-lluvia"
  | "empresa"
  | "visita";

/** Mensaje base del documento. Los corchetes quedan literales para que la persona los complete. */
const messages: Record<WhatsappContext, string> = {
  generico:
    "Hola, quiero consultar por [casamiento / evento de empresa] en Quinta Los Galpones. Pensamos en [fecha] para unas [cantidad] personas. ¿Podemos conversar sobre las opciones y coordinar una visita?",
  casamiento:
    "Hola, quiero consultar por [casamiento] en Quinta Los Galpones. Pensamos en [fecha] para unas [cantidad] personas. ¿Podemos conversar sobre las opciones y coordinar una visita?",
  "casamiento-lluvia":
    "Hola, quiero consultar por [casamiento] en Quinta Los Galpones. Pensamos en [fecha] para unas [cantidad] personas. ¿Podemos conversar sobre las opciones, el plan de lluvia y coordinar una visita?",
  empresa:
    "Hola, quiero consultar por [evento de empresa] en Quinta Los Galpones. Pensamos en [fecha] para unas [cantidad] personas. ¿Podemos conversar sobre las opciones y coordinar una visita?",
  visita:
    "Hola, quiero coordinar una visita a Quinta Los Galpones para [casamiento / evento de empresa]. Pensamos en [fecha] para unas [cantidad] personas. ¿Qué día y horario podemos ver?",
};

export function whatsappLink(context: WhatsappContext = "generico"): string {
  const text = encodeURIComponent(messages[context]);
  return `https://wa.me/${site.whatsapp.value}?text=${text}`;
}

export type ExpressChoice = {
  tipo: "casamiento" | "empresa" | "otro";
  fecha: string; // ISO yyyy-mm-dd o "" si todavía no tiene
  invitados: "hasta-100" | "100-200" | "mas-200" | "";
};

const fechaFmt = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const invitadosTxt: Record<string, string> = {
  "hasta-100": "hasta 100",
  "100-200": "100 a 200",
  "mas-200": "más de 200",
};
const tipoTxt: Record<ExpressChoice["tipo"], string> = {
  casamiento: "casamiento",
  empresa: "evento de empresa",
  otro: "evento",
};

/** Mensaje base del documento con lo elegido en la consulta express. Lo que falta queda entre corchetes. */
export function whatsappExpressLink(c: ExpressChoice): string {
  const fecha = c.fecha ? fechaFmt(c.fecha) : "[fecha]";
  const cant = c.invitados ? invitadosTxt[c.invitados] : "[cantidad]";
  const text = `Hola, quiero consultar por ${tipoTxt[c.tipo]} en Quinta Los Galpones. Pensamos en ${fecha} para ${
    c.invitados ? "" : "unas "
  }${cant} personas. ¿Podemos conversar sobre las opciones y coordinar una visita?`;
  return `https://wa.me/${site.whatsapp.value}?text=${encodeURIComponent(text)}`;
}
