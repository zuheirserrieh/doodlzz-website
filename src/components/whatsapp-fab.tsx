"use client";

import { WhatsAppMark } from "@/components/icons";
import { useDict } from "@/components/store-provider";
import { whatsappLink } from "@/lib/site";

/** Round WhatsApp button, always visible at the bottom corner. */
export function WhatsAppFab() {
  const t = useDict();
  return (
    <a
      href={whatsappLink(t.whatsapp.greeting)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.chatLabel}
      title={t.whatsapp.chatLabel}
      className="group fixed bottom-5 end-4 z-40 flex size-[60px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_22px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 hover:text-white"
    >
      {/* Soft pulse so the button gets noticed without being in the way. */}
      <span aria-hidden className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 motion-safe:animate-[ping_2.4s_ease-out_infinite]" />
      <WhatsAppMark size={32} className="relative" />
    </a>
  );
}
