"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/icons";
import { useDict } from "@/components/store-provider";

/**
 * Shares the current page: the phone's share sheet (WhatsApp, Instagram…) when
 * available, otherwise copies the link.
 */
export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const t = useDict();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Closed the share sheet — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(t.product.share, url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`flex h-10 flex-none cursor-pointer items-center gap-1.5 rounded-full border-2 border-brand-blue bg-white px-3.5 text-sm font-extrabold text-navy hover:bg-brand-blue-soft ${className}`}
    >
      <ShareIcon size={18} />
      <span aria-live="polite">{copied ? t.product.linkCopied : t.product.share}</span>
    </button>
  );
}
