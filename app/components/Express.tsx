import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { env } from "@/config/site";
import { form } from "@/content/contacto";
import { track } from "@/lib/analytics";
import { type ExpressChoice, whatsappExpressLink } from "@/lib/whatsapp";

type Ctx = { open: (origen: string) => void; isOpen: boolean };
const ExpressContext = createContext<Ctx>({ open: () => {}, isOpen: false });
export const useExpress = () => useContext(ExpressContext);

type Step = "datos" | "salida" | "contacto" | "ok" | "error";

const TIPOS = [
  { v: "casamiento", l: "Casamiento" },
  { v: "empresa", l: "Evento de empresa" },
  { v: "otro", l: "Otro" },
] as const;
const RANGOS = [
  { v: "hasta-100", l: "Hasta 100" },
  { v: "100-200", l: "De 100 a 200" },
  { v: "mas-200", l: "Más de 200" },
  { v: "", l: "Todavía no sé" },
] as const;

/**
 * Consulta express: panel inferior en mobile, modal en desktop (<dialog> nativo).
 * Paso 1 sin datos personales. Paso 2: WhatsApp con el mensaje completado o que te escriban.
 */
export function ExpressProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("datos");
  const [choice, setChoice] = useState<ExpressChoice>({ tipo: "casamiento", fecha: "", invitados: "" });
  const [sinFecha, setSinFecha] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<{ nombre?: string; contacto?: string }>({});
  const openedAt = useRef(0);

  const open = useCallback((origen: string) => {
    const d = ref.current;
    if (!d || d.open) return;
    setStep("datos");
    setErrors({});
    d.showModal();
    openedAt.current = Date.now();
    setOpen(true);
    track("express_abierto", { origen });
  }, []);

  const close = () => ref.current?.close();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => setOpen(false);
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  async function onSubmitContacto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre = String(fd.get("nombre") || "").trim();
    const correo = String(fd.get("correo") || "").trim();
    const whatsapp = String(fd.get("whatsapp") || "").trim();
    const errs: typeof errors = {};
    if (!nombre) errs.nombre = "Contanos tu nombre.";
    if (!correo && !whatsapp) errs.contacto = "Dejanos un correo o un WhatsApp para poder responderte.";
    setErrors(errs);
    if (errs.nombre || errs.contacto) {
      const first = errs.nombre ? "express-nombre" : "express-correo";
      document.getElementById(first)?.focus();
      return;
    }
    // Antispam sin captcha: honeypot y tiempo mínimo.
    const bot = String(fd.get("sitio_web") || "") !== "" || Date.now() - openedAt.current < 2500;
    if (bot) {
      setStep("ok");
      return;
    }
    setSending(true);
    try {
      if (!env.formEndpoint) throw new Error("sin endpoint");
      const res = await fetch(env.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ origen: "express", ...choice, fecha: sinFecha ? "" : choice.fecha, nombre, correo, whatsapp }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("express_envio", { tipo: choice.tipo });
      setStep("ok");
    } catch {
      setStep("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <ExpressContext.Provider value={{ open, isOpen }}>
      {children}
      <dialog
        ref={ref}
        className="consulta"
        aria-labelledby="express-titulo"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="p-5 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id="express-titulo" className="text-h3">
              {form.title}
            </h2>
            <button type="button" className="btn btn-line !min-h-11 !px-3" onClick={close} aria-label="Cerrar el panel">
              Cerrar
            </button>
          </div>

          {step === "datos" && (
            <form
              className="mt-6 grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                track("express_paso2", { tipo: choice.tipo });
                setStep("salida");
              }}
            >
              <fieldset className="field">
                <legend className="field-label">Tipo de evento</legend>
                <div className="grid gap-2">
                  {TIPOS.map((t) => (
                    <label key={t.v} className="choice">
                      <input
                        type="radio"
                        name="tipo"
                        value={t.v}
                        checked={choice.tipo === t.v}
                        onChange={() => setChoice({ ...choice, tipo: t.v })}
                      />
                      {t.l}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field">
                <label htmlFor="express-fecha" className="field-label">
                  Fecha
                </label>
                <input
                  id="express-fecha"
                  type="date"
                  className="input"
                  min={today}
                  disabled={sinFecha}
                  value={sinFecha ? "" : choice.fecha}
                  onChange={(e) => setChoice({ ...choice, fecha: e.target.value })}
                />
                <label className="choice mt-1">
                  <input
                    type="checkbox"
                    checked={sinFecha}
                    onChange={(e) => {
                      setSinFecha(e.target.checked);
                      if (e.target.checked) setChoice({ ...choice, fecha: "" });
                    }}
                  />
                  Todavía no tengo fecha
                </label>
              </div>

              <fieldset className="field">
                <legend className="field-label">Cantidad de invitados</legend>
                <div className="grid grid-cols-2 gap-2">
                  {RANGOS.map((r) => (
                    <label key={r.l} className="choice">
                      <input
                        type="radio"
                        name="invitados"
                        value={r.v}
                        checked={choice.invitados === r.v}
                        onChange={() => setChoice({ ...choice, invitados: r.v })}
                      />
                      {r.l}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" className="btn btn-primary">
                Seguir
              </button>
            </form>
          )}

          {step === "salida" && (
            <div className="mt-6 grid gap-3">
              <p>¿Cómo preferís seguir?</p>
              <a
                className="btn btn-primary"
                href={whatsappExpressLink(choice)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("express_salida", { salida: "whatsapp", tipo: choice.tipo })}
              >
                Seguir por WhatsApp
              </a>
              <button
                type="button"
                className="btn btn-line"
                onClick={() => {
                  track("express_salida", { salida: "mensaje", tipo: choice.tipo });
                  setStep("contacto");
                }}
              >
                Prefiero que me escriban
              </button>
              <button type="button" className="link justify-self-start" onClick={() => setStep("datos")}>
                Volver a los datos
              </button>
            </div>
          )}

          {step === "contacto" && (
            <form className="mt-6 grid gap-5" onSubmit={onSubmitContacto} noValidate>
              <div className="field">
                <label htmlFor="express-nombre" className="field-label">
                  Nombre
                </label>
                <input
                  id="express-nombre"
                  name="nombre"
                  className="input"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.nombre)}
                  aria-describedby={errors.nombre ? "express-nombre-error" : undefined}
                />
                {errors.nombre && (
                  <p id="express-nombre-error" className="field-error" role="alert">
                    {errors.nombre}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="express-correo" className="field-label">
                  Correo
                </label>
                <input
                  id="express-correo"
                  name="correo"
                  type="email"
                  className="input"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.contacto)}
                  aria-describedby={errors.contacto ? "express-contacto-error" : undefined}
                />
              </div>
              <div className="field">
                <label htmlFor="express-whatsapp" className="field-label">
                  WhatsApp
                </label>
                <input
                  id="express-whatsapp"
                  name="whatsapp"
                  type="tel"
                  className="input"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.contacto)}
                  aria-describedby={errors.contacto ? "express-contacto-error" : undefined}
                />
                {errors.contacto && (
                  <p id="express-contacto-error" className="field-error" role="alert">
                    {errors.contacto}
                  </p>
                )}
              </div>
              <input type="text" name="sitio_web" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? "Enviando" : form.submit}
              </button>
              <button type="button" className="link justify-self-start" onClick={() => setStep("salida")}>
                Volver
              </button>
            </form>
          )}

          {step === "ok" && (
            <div className="mt-6 grid gap-4" role="status">
              <p className="lead">{form.success}</p>
              <button type="button" className="btn btn-primary" onClick={close}>
                Cerrar
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="mt-6 grid gap-4" role="alert">
              <p className="lead">{form.error}</p>
              <a className="btn btn-primary" href={whatsappExpressLink(choice)} target="_blank" rel="noopener noreferrer">
                Escribir por WhatsApp
              </a>
              <button type="button" className="link justify-self-start" onClick={() => setStep("contacto")}>
                Probar de nuevo
              </button>
            </div>
          )}
        </div>
      </dialog>
    </ExpressContext.Provider>
  );
}

/** Botón que abre la consulta express. Sin JS funciona como enlace a /contacto/#formulario. */
export function ExpressButton({
  label,
  origen,
  className = "btn btn-primary",
}: {
  label: string;
  origen: string;
  className?: string;
}) {
  const { open } = useExpress();
  return (
    <a
      href="/contacto/#formulario"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        open(origen);
      }}
    >
      {label}
    </a>
  );
}

/** Barra fija inferior (solo mobile). Se oculta con el panel abierto o con el teclado abierto. */
export function ExpressBar() {
  const { isOpen } = useExpress();
  const [kbd, setKbd] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setKbd(vv.height < window.innerHeight * 0.75);
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="bar-consulta noche" data-hidden={isOpen || kbd}>
      <ExpressButton label="Consultar por mi fecha" origen="barra" className="btn btn-primary w-full" />
    </div>
  );
}
