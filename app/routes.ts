import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("casamientos", "routes/casamientos.tsx"),
  route("contacto", "routes/contacto.tsx"),
  route("espacios", "routes/espacios.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
