"use client";

import Image from "next/image";
import Link from "next/link";
import { useCatalog } from "@/components/catalog-provider";
import { CategoryIcon } from "@/components/icons";
import type { Category } from "@/data/catalog";
import type { Locale } from "@/lib/i18n";

/** Home page category tile: the photo set in /admin → Categories, or the icon on a pastel tile. */
export function CategoryTile({ category, locale }: { category: Category; locale: Locale }) {
  const image = useCatalog().categoryImages[category.slug];
  const base = "relative flex h-28 snap-start flex-col items-center overflow-hidden rounded-[18px] text-center hover:text-navy";

  if (image) {
    return (
      <Link href={`/${locale}/category/${category.slug}`} className={`${base} justify-end bg-surface`}>
        <Image src={image} alt="" fill unoptimized sizes="132px" className="object-cover" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy/75 to-transparent" aria-hidden />
        <span className="relative px-1.5 pb-2 text-[13px] leading-tight font-bold text-white">{category.shortName[locale]}</span>
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/category/${category.slug}`} className={`${base} justify-center gap-2 p-2 hover:brightness-[0.97] ${category.tint}`}>
      <CategoryIcon name={category.icon} />
      <span className="text-[13px] leading-tight font-bold">{category.shortName[locale]}</span>
    </Link>
  );
}
