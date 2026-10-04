"use client";

import { useSearchParams } from "next/navigation";
import { useCatalog } from "@/components/catalog-provider";
import { Listing } from "@/components/listing";
import { SearchForm } from "@/components/search-form";
import { useDict, useStore } from "@/components/store-provider";
import { getAgeGroup, getCategory } from "@/data/catalog";
import { searchProducts } from "@/data/products";

/** Filters come from the URL (?q=, ?age=, ?category=, ?tab=) and are applied in the browser. */
export function ShopView() {
  const { locale } = useStore();
  const t = useDict();
  const params = useSearchParams();
  const { products } = useCatalog();
  const q = params.get("q")?.trim() ?? "";
  const age = getAgeGroup(params.get("age") ?? "");
  const category = getCategory(params.get("category") ?? "");
  const tab = params.get("tab");

  let list = searchProducts(products, q);
  if (age) list = list.filter((p) => p.ages.includes(age.slug));
  if (category) list = list.filter((p) => p.category === category.slug);
  if (tab === "best") list = list.filter((p) => p.bestSeller);
  if (tab === "new") list = list.filter((p) => p.isNew);

  let title = t.listing.allProducts;
  if (q) title = t.listing.searchFor(q);
  else if (category) title = category.name[locale];
  else if (age) title = t.listing.ageTitle(`${age.label} ${age.unit === "months" ? t.age.months : t.age.years}`);
  else if (tab === "best") title = t.picked.best;
  else if (tab === "new") title = t.picked.fresh;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <SearchForm
          key={`${q}|${age?.slug}|${category?.slug}`}
          defaultQuery={q}
          defaultScope={age ? `age:${age.slug}` : category ? `category:${category.slug}` : ""}
        />
      </div>
      <Listing locale={locale} title={title} products={list} activeCategory={category?.slug} />
    </>
  );
}
