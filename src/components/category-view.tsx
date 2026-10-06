"use client";

import { useSearchParams } from "next/navigation";
import { useCatalog } from "@/components/catalog-provider";
import { Listing } from "@/components/listing";
import { useStore } from "@/components/store-provider";
import { getCategory, getSubcategory } from "@/data/catalog";

/** Category page; ?sub= picks a subcategory (e.g. /category/baby-essentials?sub=strollers). */
export function CategoryView({ slug }: { slug: string }) {
  const { locale } = useStore();
  const { products } = useCatalog();
  const category = getCategory(slug)!;
  const sub = getSubcategory(slug, useSearchParams().get("sub") ?? undefined);
  const list = products.filter((p) => p.category === slug && (!sub || p.subcategory === sub.slug));

  return (
    <Listing
      key={sub?.slug ?? "all"}
      locale={locale}
      title={sub ? sub.name[locale] : category.name[locale]}
      products={list}
      activeCategory={slug}
      activeSub={sub?.slug ?? ""}
    />
  );
}
