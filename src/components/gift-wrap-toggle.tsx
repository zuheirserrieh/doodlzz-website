"use client";

import type { Product } from "@/data/products";
import { useDict, usePrice } from "@/components/store-provider";

/** Gift wrap fee for one cart line (per unit × quantity; 0 when not wrapped or not offered). */
export function wrapFee(product: Product, qty: number, wrap: boolean | undefined) {
  return wrap && product.giftWrap ? (product.giftWrapPrice ?? 0) * qty : 0;
}

/**
 * "🎁 Gift wrap  FREE / +$x" switch for one product. Renders nothing when the product doesn't
 * offer gift wrap (set per product in /admin → Products).
 */
export function GiftWrapOption({
  product,
  checked,
  onChange,
  compact = false,
  className = "",
}: {
  product: Product;
  checked: boolean;
  onChange: (on: boolean) => void;
  compact?: boolean;
  className?: string;
}) {
  const t = useDict();
  const price = usePrice();
  if (!product.giftWrap) return null;
  const fee = product.giftWrapPrice ?? 0;

  return (
    <label
      className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border-2 transition-colors ${
        checked ? "border-accent/40 bg-accent/5" : "border-dashed border-line bg-white"
      } ${compact ? "px-2.5 py-1.5" : "px-3.5 py-2.5"} ${className}`}
    >
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={`relative flex-none rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-accent ${
          compact ? "h-5 w-9" : "h-6 w-11"
        } ${checked ? "bg-accent" : "bg-line"}`}
      >
        <span
          className={`absolute top-0.5 rounded-full bg-white shadow transition-[inset-inline-start] ${compact ? "size-4" : "size-5"} ${
            checked ? (compact ? "start-[18px]" : "start-[22px]") : "start-0.5"
          }`}
        />
      </span>
      <span aria-hidden className={compact ? "text-base" : "text-xl"}>
        🎁
      </span>
      <span className={`flex-1 font-extrabold ${compact ? "text-[13px]" : "text-[15px]"}`}>{t.checkout.giftWrap}</span>
      <span className={`rounded-full bg-sky font-extrabold text-white ${compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"}`}>
        {fee > 0 ? `+${price(fee)}` : t.checkout.free}
      </span>
    </label>
  );
}
