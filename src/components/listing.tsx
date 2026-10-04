import Link from "next/link";
import { categories } from "@/data/catalog";
import type { Product } from "@/data/products";
import { ProductGrid } from "@/components/product-card";
import { getDictionary, type Locale } from "@/lib/i18n";

/** Shared layout for search, shop-by-age and category listings. */
export function Listing({
  locale,
  title,
  products,
  activeCategory,
}: {
  locale: Locale;
  title: string;
  products: Product[];
  activeCategory?: string;
}) {
  const t = getDictionary(locale);
  const chip = "flex h-10 flex-none items-center rounded-full px-4 text-sm font-bold whitespace-nowrap";

  return (
    <div className="mx-auto max-w-6xl pt-4">
      <nav aria-label={t.catalog.title} className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        <Link
          href={`/${locale}/shop`}
          aria-current={!activeCategory ? "page" : undefined}
          className={`${chip} ${!activeCategory ? "bg-navy text-white hover:text-white" : "bg-line"}`}
        >
          {t.listing.allProducts}
        </Link>
        {categories.map((c) => {
          const active = c.slug === activeCategory;
          return (
            <Link
              key={c.slug}
              href={`/${locale}/category/${c.slug}`}
              aria-current={active ? "page" : undefined}
              className={`${chip} ${active ? "bg-navy text-white hover:text-white" : c.tint}`}
            >
              {c.shortName[locale]}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 pt-6">
        <h1 className="font-display text-[28px] leading-tight font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted">{t.listing.results(products.length)}</p>
        <div className="mt-5">
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="rounded-2xl bg-surface p-6 text-center text-ink-soft">{t.listing.empty}</p>
          )}
        </div>
      </div>
    </div>
  );
}
