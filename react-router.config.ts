import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  ssr: false,
  prerender: [
    "/",
    "/casamientos",
    "/eventos-empresariales",
    "/espacios",
    "/eventos-reales",
    "/preguntas-frecuentes",
    "/contacto",
    "/politica-de-privacidad",
    "/404",
  ],
} satisfies Config;
