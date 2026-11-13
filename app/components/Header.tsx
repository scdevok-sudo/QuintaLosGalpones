import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Logo } from "~/components/Logo";
import { nav, navAction } from "@/content/common";
import { track } from "@/lib/analytics";

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  // Cierra el menú al navegar.
  useEffect(() => setOpen(false), [pathname, hash]);

  // Bloquea el scroll del fondo y permite cerrar con Esc.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="dia sticky top-0 z-40 border-b border-tinta/15">
      <div
        className="wrap flex items-center justify-between gap-3"
        style={{ height: "var(--header-h)" }}
      >
        <Link
          to="/"
          viewTransition
          className="relative z-[2] flex shrink-0 items-center no-underline"
          aria-label="Quinta Los Galpones, ir al inicio"
        >
          <Logo tone="oscuro" height={40} />
        </Link>

        <button
          type="button"
          className="btn btn-line relative z-[2] !min-h-11 !px-4 min-[75rem]:hidden"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>

        <nav id="site-nav" aria-label="Principal" className="site-nav" data-open={open}>
          <ul className="site-nav-list">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === "/"} viewTransition className="nav-link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link
            to={navAction.to}
            viewTransition
            className="btn btn-primary site-nav-action"
            onClick={() => track("click_coordinar_visita", { origen: "menu" })}
          >
            {navAction.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
