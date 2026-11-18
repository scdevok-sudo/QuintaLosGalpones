import { useEffect, useRef, useState } from "react";
import { AMBIENTES, CAMPOS_POR_TIPO, HONEYPOT, RANGOS, TIPOS, type Tipo, buildPayload, enviarConsulta, esBot, tipoDesdeUrl } from "@/config/consulta";
import { campos, form } from "@/content/contacto";
import { track } from "@/lib/analytics";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Formulario completo de Contacto. Está en el HTML prerenderizado y se activa al hidratar; sin JS la página ofrece
 * WhatsApp (los dos botones de la cabecera y el aviso de acá). `?tipo=empresa` preselecciona el tipo de evento.
 * Opciones, rangos y campos por tipo viven en src/config/consulta.ts.
 */
export function ContactForm() {
  const [tipo, setTipo] = useState<Tipo>("casamiento");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<{ nombre?: string; contacto?: string }>({});
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
    const t = tipoDesdeUrl(new URLSearchParams(location.search).get("tipo"));
    if (t) setTipo(t);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const valores = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
    const get = (k: string) => (valores[k] ?? "").trim();
    const errs: typeof errors = {};
    if (!get("nombre")) errs.nombre = "Contanos tu nombre.";
    if (!get("correo") && !get("whatsapp")) errs.contacto = "Dejanos un correo o un WhatsApp para poder responderte.";
    setErrors(errs);
    if (errs.nombre || errs.contacto) {
      document.getElementById(errs.nombre ? "cf-nombre" : "cf-correo")?.focus();
      return;
    }
    const ms = Date.now() - openedAt.current;
    if (esBot(valores, ms)) {
      setStatus("ok");
      return;
    }
    setStatus("sending");
    const ok = await enviarConsulta(buildPayload("contacto", { ...valores, tipo: undefined }, tipo, ms));
    if (ok) track("contacto_envio", { tipo });
    setStatus(ok ? "ok" : "error");
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
        {/* Campos propios del tipo de evento. Casamiento y empresa tienen dos cada uno: cambiar no mueve el resto. */}
        {CAMPOS_POR_TIPO[tipo].map((f) =>
          f.type === "choice" ? (
            <div className="field" key={`${tipo}-${f.name}`}>
              <label htmlFor={`cf-${f.name}`} className="field-label">
                {f.label}
              </label>
              <select id={`cf-${f.name}`} name={f.name} className="input" defaultValue="">
                {f.opciones?.map((o) => (
                  <option key={o.l} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="field" key={`${tipo}-${f.name}`}>
              <label htmlFor={`cf-${f.name}`} className="field-label">
                {f.label}
              </label>
              <input id={`cf-${f.name}`} name={f.name} className="input" autoComplete={f.name === "organizacion" ? "organization" : "off"} />
            </div>
          ),
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
          <label htmlFor="cf-ambiente" className="field-label">
            {campos.ambiente}
          </label>
          <select id="cf-ambiente" name="ambiente" className="input">
            {AMBIENTES.map((a) => (
              <option key={a.l} value={a.v}>
                {a.l}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cf-mensaje" className="field-label">
            {campos.mensaje}
          </label>
          <textarea id="cf-mensaje" name="mensaje" className="input" rows={4} />
        </div>
        <input type="text" name={HONEYPOT} className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
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
