"use client";

import { useCatalog } from "@/components/catalog-provider";
import { useDict, usePrice, useStore } from "@/components/store-provider";

/** Gift wrap fee for the current cart (0 when off, disabled, or free). */
export function useGiftWrapFee() {
  const { giftWrap: setting } = useCatalog();
  const { giftWrap } = useStore();
  return setting.enabled && giftWrap ? setting.price : 0;
}

/** "🎁 Gift wrap  FREE / $x" switch. Hidden when gift wrap is turned off in /admin → Settings. */
export function GiftWrapToggle({ className = "" }: { className?: string }) {
  const { giftWrap: setting } = useCatalog();
  const { giftWrap, setGiftWrap } = useStore();
  const t = useDict();
  const price = usePrice();
  if (!setting.enabled) return null;

  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-2xl bg-surface px-3.5 py-3 ${className}`}>
      <input type="checkbox" role="switch" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="peer sr-only" />
      {/* Switch track + knob */}
      <span
        aria-hidden
        className={`relative h-7 w-12 flex-none rounded-full shadow-inner transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-accent ${
          giftWrap ? "bg-accent/25" : "bg-white"
        }`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-accent shadow-md transition-[inset-inline-start] ${giftWrap ? "start-[22px]" : "start-0.5"}`}
        />
      </span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-accent" aria-hidden>
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
      </svg>
      <span className="flex-1 text-[15px] font-extrabold">{t.checkout.giftWrap}</span>
      <span className="rounded-full bg-sky px-3 py-1 text-xs font-extrabold text-white">
        {setting.price > 0 ? `+${price(setting.price)}` : t.checkout.free}
      </span>
    </label>
  );
}
