import type { Cta, Meta } from "./types";

export const meta: Meta = {
  path: "/contacto/",
  title: "Contacto y visitas | Quinta Los Galpones",
  description:
    "Contanos qué evento querés organizar en Benavídez. Enviá tu fecha y cantidad de invitados o coordiná una visita a Quinta Los Galpones.",
};

export const hero = {
  h1: "Contanos qué querés celebrar",
  body: "Con la fecha posible, la cantidad aproximada de personas y una idea del evento podemos empezar a conversar. Si todavía estás explorando opciones, vení a recorrer la quinta: vas a poder ver el parque, el espacio cubierto y los posibles armados.",
  ctaWhatsapp: { label: "Escribir por WhatsApp", whatsapp: "generico" } satisfies Cta,
  ctaVisita: { label: "Coordinar una visita", whatsapp: "visita" } satisfies Cta,
};

export const form = {
  title: "Pedí una propuesta para tu evento",
  help: "Contanos lo que ya sabés. Si falta definir la fecha o la cantidad de invitados, podés indicarlo en el mensaje.",
  submit: "Enviar consulta",
  success: "Recibimos tu mensaje. Te vamos a responder por el medio que indicaste.",
  error: "No pudimos enviar la consulta. Probá nuevamente o escribinos por WhatsApp.",
};

export const llegar = {
  h2: "Para llegar",
  body: "Quintino Bocayuva 655, Benavídez, provincia de Buenos Aires. A 500 metros de Panamericana.",
};
