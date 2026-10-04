"use client";

import { WhatsAppIcon } from "@/components/icons";
import { useDict } from "@/components/store-provider";
import { whatsappLink } from "@/lib/site";

export function WhatsAppFab() {
  const t = useDict();
  return (
    <a
      href={whatsappLink(t.whatsapp.greeting)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.chatLabel}
      className="fixed bottom-5 end-4 z-40 flex h-14 items-center gap-2 rounded-full bg-whatsapp ps-3.5 pe-[18px] text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(30,39,66,0.22)] hover:text-white hover:brightness-110"
    >
      <WhatsAppIcon size={26} />
      {t.whatsapp.chat}
    </a>
  );
}
