import type { WhatsappContext } from "@/lib/whatsapp";

export type Cta =
  | { label: string; to: string; whatsapp?: never }
  | { label: string; whatsapp: WhatsappContext; to?: never };

export type Meta = {
  path: string;
  title: string;
  description: string;
};
