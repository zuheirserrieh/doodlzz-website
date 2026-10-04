"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/product-card";
import { useDict, useStore } from "@/components/store-provider";
import { products } from "@/data/products";

export function FavoritesView() {
  const { locale, wishlist } = useStore();
  const t = useDict();
  const saved = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <h1 className="font-display text-[28px] font-semibold">{t.wishlist.title}</h1>
      {saved.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl bg-surface px-6 py-14 text-center">
          <p className="max-w-xs text-ink-soft">{t.wishlist.empty}</p>
          <Link
            href={`/${locale}/shop`}
            className="flex h-12 items-center rounded-full bg-accent px-6 font-extrabold text-white hover:text-white"
          >
            {t.wishlist.browse}
          </Link>
        </div>
      ) : (
        <div className="mt-5">
          <ProductGrid products={saved} />
        </div>
      )}
    </div>
  );
}
