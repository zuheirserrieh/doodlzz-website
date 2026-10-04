import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { categories, getCategory } from "@/data/catalog";
import { products } from "@/data/products";
import { isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((locale) => categories.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/category/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = getCategory(slug);
  if (!isLocale(locale) || !category) return {};
  return { title: category.name[locale] };
}

export default async function CategoryPage({ params }: PageProps<"/[locale]/category/[slug]">) {
  const { locale, slug } = await params;
  const category = getCategory(slug);
  if (!isLocale(locale) || !category) notFound();

  return (
    <Listing
      locale={locale}
      title={category.name[locale]}
      products={products.filter((p) => p.category === category.slug)}
      activeCategory={category.slug}
    />
  );
}
