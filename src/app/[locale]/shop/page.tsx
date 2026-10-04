import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SearchBar } from "@/components/home-sections";
import { Listing } from "@/components/listing";
import { getAgeGroup } from "@/data/catalog";
import { searchProducts } from "@/data/products";
import { getDictionary, isLocale } from "@/lib/i18n";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).listing.allProducts };
}

export default async function ShopPage({ params, searchParams }: PageProps<"/[locale]/shop">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const query = await searchParams;
  const q = one(query.q)?.trim() ?? "";
  const age = getAgeGroup(one(query.age) ?? "");
  const tab = one(query.tab);

  let list = searchProducts(q);
  if (age) list = list.filter((p) => p.ages.includes(age.slug));
  if (tab === "best") list = list.filter((p) => p.bestSeller);
  if (tab === "new") list = list.filter((p) => p.isNew);

  let title = t.listing.allProducts;
  if (q) title = t.listing.searchFor(q);
  else if (age) title = t.listing.ageTitle(`${age.label} ${age.unit === "months" ? t.age.months : t.age.years}`);
  else if (tab === "best") title = t.picked.best;
  else if (tab === "new") title = t.picked.fresh;

  return (
    <>
      <SearchBar locale={locale} defaultValue={q} />
      <Listing locale={locale} title={title} products={list} />
    </>
  );
}
