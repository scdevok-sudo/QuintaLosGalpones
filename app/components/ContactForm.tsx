import { useEffect, useRef, useState } from "react";
import { env } from "@/config/site";
import { campos, form } from "@/content/contacto";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/lib/whatsapp";

type Tipo = "casamiento" | "empresa" | "otro";
const TIPOS: { v: Tipo; l: string }[] = [
  { v: "casamiento", l: "Casamiento" },
  { v: "empresa", l: "Evento de empresa" },
  { v: "otro", l: "Otro" },
];
const RANGOS = [
  { v: "", l: "Todavía no sé" },
  { v: "hasta-100", l: "Hasta 100" },
  { v: "100-200", l: "De 100 a 200" },
  { v: "mas-200", l: "Más de 200" },
];

/**
 * Formulario completo de Contacto. Se activa al hidratar; sin JS la página ofrece WhatsApp (los dos botones
 * de la cabecera y el aviso de acá). `?tipo=empresa` en la URL preselecciona el tipo de evento.
 */
export function ContactForm() {
  const [tipo, setTipo] = useState<Tipo>("casamiento");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<{ nombre?: string; contacto?: string }>({});
  const openedAt = useRef(0);

  // El formulario está en el HTML prerenderizado (no se monta al hidratar: sin saltos ni trabajo extra).
  useEffect(() => {
    openedAt.current = Date.now();
    const t = new URLSearchParams(location.search).get("tipo");
    if (t === "empresa" || t === "casamiento" || t === "otro") setTipo(t);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) || "").trim();
    const errs: typeof errors = {};
    if (!get("nombre")) errs.nombre = "Contanos tu nombre.";
    if (!get("correo") && !get("whatsapp")) errs.contacto = "Dejanos un correo o un WhatsApp para poder responderte.";
    setErrors(errs);
    if (errs.nombre || errs.contacto) {
      document.getElementById(errs.nombre ? "cf-nombre" : "cf-correo")?.focus();
      return;
    }
    // Antispam sin captcha: honeypot y tiempo mínimo.
    if (get("sitio_web") !== "" || Date.now() - openedAt.current < 2500) {
      setStatus("ok");
      return;
    }
    setStatus("sending");
    try {
      if (!env.formEndpoint) throw new Error("sin endpoint");
      const datos = Object.fromEntries([...fd.entries()].filter(([k]) => k !== "sitio_web"));
      const res = await fetch(env.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ origen: "contacto", ...datos, tipo }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("contacto_envio", { tipo });
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="grid gap-4" role="status">
        <svg className="tick" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="23" />
          <path d="M15 27 l8 8 l15-17" />
        </svg>
        <p className="lead">{form.success}</p>
      </div>
    );
  }

  return (
    <>
      {/* Sin JS el formulario no se puede enviar: se oculta y queda el aviso con WhatsApp. */}
      <noscript>
        <p>
          {campos.noJs}{" "}
          <a className="link" href={whatsappLink("generico")} target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </a>
        </p>
        <style>{".cf{display:none}"}</style>
      </noscript>
    <form className="cf" method="dialog" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="cf-nombre" className="field-label">
          Nombre
        </label>
        <input
          id="cf-nombre"
          name="nombre"
          className="input"
          autoComplete="name"
          aria-invalid={Boolean(errors.nombre)}
          aria-describedby={errors.nombre ? "cf-nombre-error" : undefined}
        />
        {errors.nombre && (
          <p id="cf-nombre-error" className="field-error" role="alert">
            {errors.nombre}
          </p>
        )}
      </div>
      <div className="cf-2">
        <div className="field">
          <label htmlFor="cf-correo" className="field-label">
            Correo
          </label>
          <input
            id="cf-correo"
            name="correo"
            type="email"
            className="input"
            autoComplete="email"
            aria-invalid={Boolean(errors.contacto)}
            aria-describedby={errors.contacto ? "cf-contacto-error" : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor="cf-whatsapp" className="field-label">
            WhatsApp
          </label>
          <input
            id="cf-whatsapp"
            name="whatsapp"
            type="tel"
            className="input"
            autoComplete="tel"
            aria-invalid={Boolean(errors.contacto)}
            aria-describedby={errors.contacto ? "cf-contacto-error" : undefined}
          />
        </div>
      </div>
      {errors.contacto && (
        <p id="cf-contacto-error" className="field-error" role="alert">
          {errors.contacto}
        </p>
      )}
      <fieldset className="field">
        <legend className="field-label">{campos.tipo}</legend>
        <div className="grid gap-2 min-[30rem]:grid-cols-3">
          {TIPOS.map((t) => (
            <label key={t.v} className="choice">
              <input type="radio" name="tipo_evento" value={t.v} checked={tipo === t.v} onChange={() => setTipo(t.v)} />
              {t.l}
            </label>
          ))}
        </div>
      </fieldset>
      {tipo === "empresa" && (
        <div className="field">
          <label htmlFor="cf-org" className="field-label">
            {campos.organizacion}
          </label>
          <input id="cf-org" name="organizacion" className="input" autoComplete="organization" />
        </div>
      )}
      <div className="cf-2">
        <div className="field">
          <label htmlFor="cf-fecha" className="field-label">
            {campos.fecha}
          </label>
          <input id="cf-fecha" name="fecha" type="date" className="input" min={new Date().toISOString().slice(0, 10)} aria-describedby="cf-fecha-ayuda" />
          <p id="cf-fecha-ayuda" className="cf-ayuda">
            {campos.fechaAyuda}
          </p>
        </div>
        <div className="field">
          <label htmlFor="cf-invitados" className="field-label">
            {campos.invitados}
          </label>
          <select id="cf-invitados" name="invitados" className="input">
            {RANGOS.map((r) => (
              <option key={r.l} value={r.v}>
                {r.l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="cf-mensaje" className="field-label">
          {campos.mensaje}
        </label>
        <textarea id="cf-mensaje" name="mensaje" className="input" rows={4} />
      </div>
      <input type="text" name="sitio_web" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div>
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Enviando" : form.submit}
        </button>
      </div>
      {status === "error" && (
        <div className="grid gap-3" role="alert">
          <p>{form.error}</p>
          <a className="btn btn-line justify-self-start" href={whatsappLink("generico")} target="_blank" rel="noopener noreferrer">
            Escribir por WhatsApp
          </a>
        </div>
      )}
    </form>
    </>
  );
}
