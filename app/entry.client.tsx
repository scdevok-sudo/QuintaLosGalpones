import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// El HTML prerenderizado se lee sin JS. scripts/postbuild.mjs difiere la descarga de este módulo
// hasta que la página terminó de cargar o hasta la primera interacción.
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
