import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "app",
  ssr: false,
  prerender: ["/", "/casamientos", "/404"],
} satisfies Config;
