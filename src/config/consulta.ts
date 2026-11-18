/**
 * Configuración única de la consulta: la usan el panel de consulta express, el formulario de Contacto y el envío.
 * Para cambiar opciones, rangos o campos por tipo de evento se toca solo este archivo.
 * Los rangos de invitados son opciones de formulario, no una afirmación de capacidad (BRIEF-V2 7.1);
 * siguen pendientes de confirmar con el cliente (ver `rangosValidated`).
 */
import { env } from "./site";

export type Tipo = "casamiento" | "empresa" | "otro";

export const TIPOS: { v: Tipo; l: string; corto: string }[] = [
  { v: "casamiento", l: "Casamiento", corto: "Casamiento" },
  { v: "empresa", l: "Evento de empresa", corto: "Empresa" },
  { v: "otro", l: "Otro", corto: "Otro" },
];

export const RANGOS = [
  { v: "", l: "Todavía no sé" },
  { v: "hasta-100", l: "Hasta 100" },
  { v: "100-200", l: "De 100 a 200" },
  { v: "mas-200", l: "Más de 200" },
] as const;
export type Rango = (typeof RANGOS)[number]["v"];

/** Pasa a true cuando el cliente confirme los rangos. check:launch avisa mientras sea false. */
export const rangosValidated = false;

/** Ambiente que imagina quien consulta. Es una pregunta de formulario, no una afirmación sobre el lugar. */
export const AMBIENTES = [
  { v: "", l: "A definir" },
  { v: "aire-libre", l: "Al aire libre" },
  { v: "cubierto", l: "Espacio cubierto" },
  { v: "ambos", l: "Los dos" },
] as const;

/** Lo que falta se envía como "A definir" para que la planilla no quede con celdas vacías. */
export const A_DEFINIR = "A definir";

export type CampoCondicional = { name: string; label: string; ayuda?: string; type?: "text" | "choice"; opciones?: { v: string; l: string }[] };

/** Campos extra por tipo de evento. Los textos salen del copy del documento (FAQ "¿Cómo pido un presupuesto?"). */
export const CAMPOS_POR_TIPO: Record<Tipo, CampoCondicional[]> = {
  casamiento: [
    { name: "pareja", label: "Nombres de la pareja" },
    {
      name: "ceremonia",
      label: "¿Querés hacer la ceremonia en la quinta?",
      type: "choice",
      opciones: [
        { v: "si", l: "Sí" },
        { v: "no", l: "No" },
        { v: "", l: "A definir" },
      ],
    },
  ],
  empresa: [
    { name: "organizacion", label: "Nombre de la organización" },
    { name: "objetivo", label: "Objetivo del encuentro" },
  ],
  otro: [],
};

export const tipoDesdeUrl = (v: string | null): Tipo | null => (v === "casamiento" || v === "empresa" || v === "otro" ? v : null);

/** Tiempo mínimo entre abrir el formulario y enviarlo, y campo trampa. Se repite en el servidor (Code.gs). */
export const MIN_MS = 2500;
export const HONEYPOT = "sitio_web";

export type Payload = Record<string, string>;

/** Arma lo que se envía: recorta, completa con "A definir" y suma la página de origen. */
export function buildPayload(origen: "contacto" | "express", valores: Record<string, string | undefined>, tipo: Tipo, msAbierto: number): Payload {
  const out: Payload = {
    origen,
    pagina: typeof location === "undefined" ? "" : location.pathname,
    tipo,
    ms: String(Math.round(msAbierto)),
  };
  for (const [k, v] of Object.entries(valores)) {
    if (k === HONEYPOT || k === "tipo" || k === "tipo_evento") continue;
    out[k] = (v ?? "").trim();
  }
  for (const k of ["fecha", "invitados", "ambiente", "mensaje"]) if (!out[k]) out[k] = A_DEFINIR;
  if (valores[HONEYPOT]) out[HONEYPOT] = String(valores[HONEYPOT]);
  return out;
}

export function esBot(valores: Record<string, string | undefined>, msAbierto: number): boolean {
  return Boolean(valores[HONEYPOT]) || msAbierto < MIN_MS;
}

/**
 * POST como text/plain (evita el preflight de CORS con Google Apps Script). Devuelve true si el servidor confirma.
 * Si no hay VITE_FORM_ENDPOINT falla a propósito: la interfaz muestra el error del documento con WhatsApp.
 */
export async function enviarConsulta(payload: Payload): Promise<boolean> {
  if (!env.formEndpoint) return false;
  try {
    const res = await fetch(env.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => ({ ok: true }))) as { ok?: boolean };
    return data.ok !== false;
  } catch {
    return false;
  }
}
