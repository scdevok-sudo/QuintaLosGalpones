import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { nav, navAction } from "@/content/common";
import { site } from "@/config/site";
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
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream">
      <div className="wrap flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
        <Link to="/" viewTransition className="relative z-[2] flex items-center gap-3 no-underline" aria-label={`${site.name}, ir al inicio`}>
          <img src="/logo-circle.png" alt="" width={44} height={44} className="h-11 w-11 rounded-full" />
          <span className="whitespace-nowrap font-display text-[1.15rem] leading-none font-medium tracking-tight text-forest">
            Quinta
            <br className="sm:hidden" /> Los&nbsp;Galpones
          </span>
        </Link>

        <button
          type="button"
          className="btn btn-ghost relative z-[2] !min-h-11 !px-4 xl:hidden"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>

        <nav id="site-nav" aria-label="Principal" className="site-nav" data-open={open}>
          <ul className="site-nav-list">
            {nav
              .filter((i) => !("hidden" in i && i.hidden))
              .map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    viewTransition
                    className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
                  >
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
