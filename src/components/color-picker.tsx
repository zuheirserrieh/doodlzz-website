"use client";

import { useStore } from "@/components/store-provider";
import { getColor } from "@/data/catalog";
import type { Product } from "@/data/products";

/** Colours the product comes in (unknown slugs skipped). */
export function productColors(product: Product) {
  return (product.colors ?? []).flatMap((slug) => {
    const c = getColor(slug);
    return c ? [c] : [];
  });
}

/** Swatches the customer taps to pick a colour; the chosen one is outlined with a ✓. */
export function ColorPicker({
  product,
  value,
  onChange,
  compact = false,
  label,
}: {
  product: Product;
  value?: string;
  onChange: (slug: string) => void;
  compact?: boolean;
  label: string;
}) {
  const { locale } = useStore();
  const colors = productColors(product);
  if (colors.length === 0) return null;
  return (
    <div role="radiogroup" aria-label={label} className={`flex flex-wrap items-center ${compact ? "gap-1.5" : "gap-2"}`}>
      {colors.map((c) => {
        const on = value === c.slug;
        return (
          <button
            key={c.slug}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(c.slug)}
            className={`flex cursor-pointer items-center rounded-full border-2 font-bold ${
              compact ? "h-8 gap-1 ps-0.5 pe-2 text-xs" : "h-10 gap-1.5 ps-1 pe-3 text-sm"
            } ${on ? "border-navy bg-surface" : "border-line bg-white"}`}
          >
            <span
              className={`${compact ? "size-6" : "size-7"} flex-none rounded-full ring-1 ring-black/15`}
              style={{ background: c.hex }}
              aria-hidden
            />
            {c.name[locale]}
            {on && <span aria-hidden>✓</span>}
          </button>
        );
      })}
    </div>
  );
}
