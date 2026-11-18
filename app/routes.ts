import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("casamientos", "routes/casamientos.tsx"),
  route("eventos-empresariales", "routes/empresas.tsx"),
  route("espacios", "routes/espacios.tsx"),
  route("eventos-reales", "routes/reales.tsx"),
  route("preguntas-frecuentes", "routes/faq.tsx"),
  route("contacto", "routes/contacto.tsx"),
  route("politica-de-privacidad", "routes/privacidad.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
