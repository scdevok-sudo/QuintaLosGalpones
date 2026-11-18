import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  ssr: false,
  prerender: ["/", "/casamientos", "/contacto", "/espacios", "/404"],
} satisfies Config;
