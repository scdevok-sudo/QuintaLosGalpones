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
