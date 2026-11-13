import type { Cta, Meta } from "./types";

export const meta: Meta = {
  path: "/eventos-reales/",
  title: "Eventos reales en Quinta Los Galpones | Fotos y experiencias",
  description:
    "Mirá casamientos y encuentros realizados en Los Galpones. Recorré el parque, las ceremonias y los distintos armados del espacio cubierto.",
};

export const hero = {
  h1: "Así se viven los eventos en Los Galpones",
  body: "Una galería sirve más cuando permite seguir una historia. Elegí el tipo de evento que estás imaginando y mirá cómo se usaron los espacios desde la llegada hasta la fiesta.",
};

export type RealesCategory = {
  id: "casamientos" | "empresa" | "clima";
  label: string;
  h2: string;
  body: string;
  visible: boolean;
};

export const categories: RealesCategory[] = [
  {
    id: "casamientos",
    label: "Casamientos",
    h2: "Casamientos",
    // El resto de la frase del documento es política interna (ver COPY-CAMBIOS.md).
    body: "Ceremonias, recepciones y fiestas con distintos armados.",
    visible: true,
  },
  {
    id: "empresa",
    label: "Eventos de empresa",
    h2: "Eventos de empresa",
    // Oculta hasta tener ejemplos reales. Al activarla se publica solo la primera oración.
    body: "Jornadas de equipo y celebraciones que muestren la distribución del parque y el espacio cubierto.",
    visible: false,
  },
  {
    id: "clima",
    label: "Cuando llueve",
    h2: "El lugar también cuando cambia el clima",
    // Línea pública escrita por nosotros (la del documento es una nota interna).
    body: "Mirá cómo se vive la celebración bajo techo cuando llueve.",
    visible: true,
  },
];

export const cta: Cta = { label: "Consultar por un evento como este", to: "/contacto/#formulario" };
