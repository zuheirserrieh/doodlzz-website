import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/category-view";
import { categories, getCategory } from "@/data/catalog";
import { isLocale, locales } from "@/lib/i18n";

// Categories are fixed in code (src/data/catalog.ts); products load in the browser.
export const dynamicParams = false;

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
  if (!isLocale(locale) || !getCategory(slug)) notFound();
  return <CategoryView slug={slug} />;
}
