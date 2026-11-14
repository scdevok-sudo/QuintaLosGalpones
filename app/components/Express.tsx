import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { env } from "@/config/site";
import { form } from "@/content/contacto";
import { track } from "@/lib/analytics";
import { type ExpressChoice, whatsappExpressLink, whatsappLink } from "@/lib/whatsapp";

type Ctx = { isOpen: boolean; kbd: boolean };
const ExpressContext = createContext<Ctx>({ isOpen: false, kbd: false });

declare global {
  interface Window {
    __qgReady?: boolean;
  }
}
export const useExpress = () => useContext(ExpressContext);

type Step = "datos" | "salida" | "contacto" | "ok" | "error";

const TIPOS = [
  { v: "casamiento", l: "Casamiento" },
  { v: "empresa", l: "Empresa" },
  { v: "otro", l: "Otro" },
] as const;
const RANGOS = [
  { v: "", l: "Todavía no sé" },
  { v: "hasta-100", l: "Hasta 100" },
  { v: "100-200", l: "De 100 a 200" },
  { v: "mas-200", l: "Más de 200" },
] as const;

/**
 * Consulta express: panel NO modal con la Popover API nativa.
 *  - Está en el HTML prerenderizado y los botones lo abren con `popovertarget`: se abre sin JS y sin
 *    esperar la hidratación. Esc y el clic afuera lo cierran de forma nativa.
 *  - Sin JS (o antes de hidratar) el panel muestra el botón de WhatsApp con el mensaje genérico.
 *  - React lo mejora: pasos (fecha y tipo, salida, contacto) y envío del formulario.
 * Mobile: anclado arriba de la barra inferior. Desktop: flota abajo a la derecha. No bloquea la página.
 */
export function ExpressProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [kbd, setKbd] = useState(false);
  const [js, setJs] = useState(false);
  const [step, setStep] = useState<Step>("datos");
  const [choice, setChoice] = useState<ExpressChoice>({ tipo: "casamiento", fecha: "", invitados: "" });
  const [invitados, setInvitados] = useState<ExpressChoice["invitados"]>("");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<{ nombre?: string; contacto?: string }>({});
  const openedAt = useRef(0);
  const origen = useRef("barra");

  const close = useCallback(() => ref.current?.hidePopover?.(), []);

  // Hidratación lista: se activan los pasos. Si el panel ya estaba abierto, se refleja.
  useEffect(() => {
    const el = ref.current;
    setJs(true);
    window.__qgReady = true;
    if (el?.matches(":popover-open")) {
      setOpen(true);
      openedAt.current = Date.now();
    }
    const onClick = (e: MouseEvent) => {
      const b = (e.target as Element | null)?.closest?.("[data-express]");
      if (b) origen.current = b.getAttribute("data-express") || "barra";
    };
    const onToggle = (e: Event) => {
      const opened = (e as Event & { newState?: string }).newState === "open";
      setOpen(opened);
      if (opened) {
        setStep("datos");
        setErrors({});
        openedAt.current = Date.now();
        track("express_abierto", { origen: origen.current });
        el?.querySelector<HTMLElement>("#express-titulo")?.focus({ preventScroll: true });
      }
    };
    // Acciones por teclado (Enter, Espacio, Esc): el panel abre y cierra sin animar.
    let t: ReturnType<typeof setTimeout> | undefined;
    const onKey = (e: KeyboardEvent) => {
      const t0 = e.target as Element | null;
      if (e.key === "Escape" || ((e.key === "Enter" || e.key === " ") && t0?.closest?.("[data-express]"))) {
        el?.setAttribute("data-instant", "");
        clearTimeout(t);
        t = setTimeout(() => el?.removeAttribute("data-instant"), 400);
      }
    };
    const onPointer = () => el?.removeAttribute("data-instant");
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("click", onClick, true);
    el?.addEventListener("toggle", onToggle);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onPointer, true);
      clearTimeout(t);
      el?.removeEventListener("toggle", onToggle);
    };
  }, []);

  // Teclado en pantalla: la altura que tapa se publica en --kb para que barra y panel suban con él.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      const on = kb > 120;
      document.documentElement.style.setProperty("--kb", on ? `${Math.round(kb)}px` : "0px");
      document.documentElement.toggleAttribute("data-kbd", on);
      setKbd(on);
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
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
      document.getElementById(errs.nombre ? "express-nombre" : "express-correo")?.focus();
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
        body: JSON.stringify({ origen: "express", ...choice, invitados, nombre, correo, whatsapp }),
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
    <ExpressContext.Provider value={{ isOpen, kbd }}>
      {children}
      <div ref={ref} id="consulta" popover="auto" role="dialog" className="consulta" aria-labelledby="express-titulo" data-step={js ? step : "base"}>
        <div className="consulta-in">
          <div className="consulta-head">
            <h2 id="express-titulo" className="consulta-title" tabIndex={-1}>
              {form.title}
            </h2>
            <button type="button" className="btn btn-line consulta-close" popoverTarget="consulta" popoverTargetAction="hide" aria-label="Cerrar el panel">
              Cerrar
            </button>
          </div>

          {!js && (
            <div className="grid gap-3">
              <p>Escribinos por WhatsApp y te respondemos por ahí.</p>
              <a className="btn btn-primary" href={whatsappLink("generico")} target="_blank" rel="noopener noreferrer">
                Escribir por WhatsApp
              </a>
            </div>
          )}

          {js && (
            <div key={step} className="step-in">
              {step === "datos" && (
                <form
                  className="consulta-datos"
                  onSubmit={(e) => {
                    e.preventDefault();
                    track("express_paso2", { tipo: choice.tipo });
                    setStep("salida");
                  }}
                >
                  <div className="field">
                    <label htmlFor="express-fecha" className="field-label">
                      Fecha, si ya la tenés
                    </label>
                    <input
                      id="express-fecha"
                      type="date"
                      className="input"
                      min={today}
                      value={choice.fecha}
                      onChange={(e) => setChoice({ ...choice, fecha: e.target.value })}
                    />
                  </div>
                  <fieldset className="field">
                    <legend className="sr-only">Tipo de evento</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {TIPOS.map((t) => (
                        <label key={t.v} className="choice choice-sm">
                          <input type="radio" name="tipo" value={t.v} checked={choice.tipo === t.v} onChange={() => setChoice({ ...choice, tipo: t.v })} />
                          {t.l}
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
                <div className="grid gap-3">
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
                <form className="grid gap-4" onSubmit={onSubmitContacto} noValidate>
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
                  <div className="field">
                    <label htmlFor="express-invitados" className="field-label">
                      Cantidad de invitados
                    </label>
                    <select id="express-invitados" className="input" value={invitados} onChange={(e) => setInvitados(e.target.value as ExpressChoice["invitados"])}>
                      {RANGOS.map((r) => (
                        <option key={r.l} value={r.v}>
                          {r.l}
                        </option>
                      ))}
                    </select>
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
                <div className="grid gap-4" role="status">
                  <svg className="tick" viewBox="0 0 52 52" aria-hidden="true">
                    <circle cx="26" cy="26" r="23" />
                    <path d="M15 27 l8 8 l15-17" />
                  </svg>
                  <p className="lead">{form.success}</p>
                  <button type="button" className="btn btn-primary" onClick={close}>
                    Cerrar
                  </button>
                </div>
              )}

              {step === "error" && (
                <div className="grid gap-4" role="alert">
                  <p className="lead">{form.error}</p>
                  <a className="btn btn-primary" href={whatsappExpressLink({ ...choice, invitados })} target="_blank" rel="noopener noreferrer">
                    Escribir por WhatsApp
                  </a>
                  <button type="button" className="link justify-self-start" onClick={() => setStep("contacto")}>
                    Probar de nuevo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ExpressContext.Provider>
  );
}

/**
 * Botón que abre la consulta express. Usa `popovertarget`: el navegador abre el panel sin JS y sin
 * esperar a que hidrate la página. `data-express` lo reconoce el cargador diferido y la analítica.
 */
export function ExpressButton({ label, origen, className = "btn btn-primary" }: { label: string; origen: string; className?: string }) {
  return (
    <button type="button" popoverTarget="consulta" popoverTargetAction="show" data-express={origen} className={className}>
      {label}
    </button>
  );
}

/** Barra fija inferior (solo mobile). El panel de consulta se ancla encima. Se oculta con el teclado abierto. */
export function ExpressBar() {
  const { kbd } = useExpress();
  return (
    <div className="bar-consulta noche" data-hidden={kbd}>
      <ExpressButton label="Consultar por mi fecha" origen="barra" className="btn btn-primary w-full" />
    </div>
  );
}
