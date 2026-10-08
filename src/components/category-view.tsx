"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCatalog } from "@/components/catalog-provider";
import { CategoryIcon } from "@/components/icons";
import { Listing } from "@/components/listing";
import { ShareButton } from "@/components/share-button";
import { useDict, useStore } from "@/components/store-provider";
import { getCategory, getSubcategory, type Category } from "@/data/catalog";
import { inCategory } from "@/data/products";

/**
 * Category page.
 *   /category/baby-essentials            → subcategory page (big round pictures)
 *   /category/baby-essentials?sub=all     → all products of the category
 *   /category/baby-essentials?sub=strollers → products of one subcategory
 * Categories without subcategories go straight to their products.
 */
export function CategoryView({ slug }: { slug: string }) {
  const { locale } = useStore();
  const { products } = useCatalog();
  const category = getCategory(slug)!;
  const param = useSearchParams().get("sub") ?? "";

  if (!param && category.subs.length > 0) return <SubcategoryLanding category={category} />;

  const sub = getSubcategory(slug, param === "all" ? undefined : param);
  const list = products.filter((p) => inCategory(p, slug, sub?.slug));

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

function SubcategoryLanding({ category }: { category: Category }) {
  const { locale } = useStore();
  const t = useDict();
  const { categoryImages } = useCatalog();
  const base = `/${locale}/category/${category.slug}`;

  const tile = (href: string, name: string, image: string | undefined, key: string) => (
    <Link key={key} href={href} className="group flex flex-col items-center gap-2 text-center">
      <span
        className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full shadow-sm ring-4 ring-white transition-transform group-hover:scale-[1.03] ${category.tint}`}
      >
        {image ? (
          <Image src={image} alt="" fill unoptimized sizes="(min-width: 768px) 160px, 30vw" className="object-cover" />
        ) : (
          <CategoryIcon name={category.icon} size={44} />
        )}
      </span>
      <span className="rounded-lg bg-white/90 px-2 py-0.5 text-[13px] leading-tight font-bold">
        {name}
      </span>
    </Link>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <div className="rounded-3xl bg-white/85 p-4 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-[28px] leading-tight font-bold">{category.name[locale]}</h1>
          <ShareButton title={category.name[locale]} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6">
          {tile(`${base}?sub=all`, t.listing.viewAll, categoryImages[category.slug], "all")}
          {category.subs.map((s) => tile(`${base}?sub=${s.slug}`, s.name[locale], categoryImages[s.slug], s.slug))}
        </div>
      </div>
    </div>
  );
}
