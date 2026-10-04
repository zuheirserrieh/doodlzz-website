"use client";

import { useCatalog } from "@/components/catalog-provider";
import { Listing } from "@/components/listing";
import { useStore } from "@/components/store-provider";
import { getCategory } from "@/data/catalog";

export function CategoryView({ slug }: { slug: string }) {
  const { locale } = useStore();
  const { products } = useCatalog();
  const category = getCategory(slug)!;
  return (
    <Listing
      locale={locale}
      title={category.name[locale]}
      products={products.filter((p) => p.category === slug)}
      activeCategory={slug}
    />
  );
}
