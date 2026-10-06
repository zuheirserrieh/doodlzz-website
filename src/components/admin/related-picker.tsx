"use client";

import Image from "next/image";
import { useState } from "react";
import { photosOf } from "@/lib/media";
import type { ProductRow } from "@/data/products";

/** Search products by name and link them as "Goes well with" items. */
export function RelatedPicker({
  value,
  onChange,
  products,
  selfId,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  products: ProductRow[];
  selfId: string;
}) {
  const [query, setQuery] = useState("");
  const byId = new Map(products.map((p) => [p.id, p]));
  const q = query.trim().toLowerCase();
  const results = q
    ? products
        .filter((p) => p.id !== selfId && !value.includes(p.id))
        .filter((p) => `${p.name_en} ${p.name_ar}`.toLowerCase().includes(q))
        .slice(0, 8)
    : [];

  const thumb = (p: ProductRow) => (
    <span className="relative size-10 flex-none overflow-hidden rounded-lg bg-surface">
      {photosOf(p.images)[0] && <Image src={photosOf(p.images)[0]} alt="" fill unoptimized sizes="40px" className="object-cover" />}
    </span>
  );

  return (
    <section className="flex flex-col gap-2">
      <span className="text-sm font-bold">Goes well with (related items)</span>
      <span className="-mt-1 text-xs text-muted">
        Shown on this product&apos;s page with an &ldquo;Add all to cart&rdquo; button, e.g. a tent with its balls.
      </span>

      {value.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {value.map((id) => {
            const p = byId.get(id);
            if (!p) return null;
            return (
              <li key={id} className="flex items-center gap-2.5 rounded-xl bg-surface p-2">
                {thumb(p)}
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name_en}</span>
                <button
                  type="button"
                  aria-label={`Remove ${p.name_en}`}
                  onClick={() => onChange(value.filter((x) => x !== id))}
                  className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-full bg-white text-xs font-extrabold"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <input
        type="search"
        placeholder="Search a product to link…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-11 w-full rounded-xl border border-[#dfe3ea] bg-white px-3 text-[15px] font-semibold outline-none focus:border-navy"
      />
      {q && (
        <ul className="flex flex-col overflow-hidden rounded-xl border border-line">
          {results.length === 0 && <li className="p-3 text-sm text-muted">No matching products.</li>}
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onChange([...value, p.id]);
                  setQuery("");
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 border-b border-line p-2 text-start last:border-b-0 hover:bg-surface"
              >
                {thumb(p)}
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name_en}</span>
                <span className="text-xs font-extrabold text-accent">+ Add</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
