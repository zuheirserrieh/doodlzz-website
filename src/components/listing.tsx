"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { CategoryIcon, CloseIcon } from "@/components/icons";
import { ProductGrid } from "@/components/product-card";
import { ageGroups, categories, getCategory } from "@/data/catalog";
import type { Product } from "@/data/products";
import { usePrice } from "@/components/store-provider";
import { getDictionary, type Locale } from "@/lib/i18n";

type Sort = "newArrivals" | "best" | "priceAsc" | "priceDesc" | "newest" | "oldest";
type Gender = "all" | "boy" | "girl";
const sorts: Sort[] = ["newArrivals", "best", "priceAsc", "priceDesc", "newest", "oldest"];

function sortProducts(list: Product[], sort: Sort) {
  const time = (p: Product) => (p.createdAt ? Date.parse(p.createdAt) : 0);
  const out = [...list];
  switch (sort) {
    case "best":
      return out.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0) || Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller)));
    case "priceAsc":
      return out.sort((a, b) => a.priceUsd - b.priceUsd);
    case "priceDesc":
      return out.sort((a, b) => b.priceUsd - a.priceUsd);
    case "newest":
      return out.sort((a, b) => time(b) - time(a));
    case "oldest":
      return out.sort((a, b) => time(a) - time(b));
    default:
      // "New arrivals": products marked New first (newest first), then the rest in the admin order.
      return out.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || (a.isNew && b.isNew ? time(b) - time(a) : 0));
  }
}

/** Shared layout for category, search and shop listings, with "Filter & sort". */
export function Listing({
  locale,
  title,
  products,
  activeCategory,
  activeSub,
  initialAge = "",
}: {
  locale: Locale;
  title: string;
  products: Product[];
  activeCategory?: string;
  /** Selected subcategory (category pages only). */
  activeSub?: string;
  initialAge?: string;
}) {
  const t = getDictionary(locale);
  const { ready, categoryImages } = useCatalog();
  const price = usePrice();
  const [sort, setSort] = useState<Sort>("newArrivals");
  const [age, setAge] = useState(initialAge);
  const [gender, setGender] = useState<Gender>("all");
  const [panelOpen, setPanelOpen] = useState(false);
  // Price range: the slider spans 0 … the highest price in this list (rounded up).
  const maxPrice = Math.max(1, Math.ceil(Math.max(0, ...products.map((p) => p.priceUsd))));
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState<number | null>(null); // null = no upper limit
  const hiPrice = priceMax ?? maxPrice;
  const priceFiltered = priceMin > 0 || (priceMax !== null && priceMax < maxPrice);
  const category = activeCategory ? getCategory(activeCategory) : undefined;

  const visible = useMemo(() => {
    let list = products;
    if (age) list = list.filter((p) => p.ages.includes(age));
    if (priceFiltered) list = list.filter((p) => p.priceUsd >= priceMin && p.priceUsd <= hiPrice);
    // No gender set on a product = suitable for both.
    if (gender !== "all") list = list.filter((p) => !p.genders?.length || p.genders.includes(gender));
    return sortProducts(list, sort);
  }, [products, age, gender, sort, priceFiltered, priceMin, hiPrice]);

  const activeFilters = (age ? 1 : 0) + (gender !== "all" ? 1 : 0) + (sort !== "newArrivals" ? 1 : 0) + (priceFiltered ? 1 : 0);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanelOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [panelOpen]);

  const chip = "flex h-10 flex-none items-center rounded-full px-4 text-sm font-bold whitespace-nowrap";
  const option = (on: boolean) =>
    `flex min-h-10 cursor-pointer items-center rounded-full border-2 px-3.5 text-sm font-bold ${on ? "border-navy bg-navy text-white" : "border-line bg-white"}`;

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
        <h1 className="font-display text-[28px] leading-tight font-bold">{title}</h1>

        {/* Subcategories as round pictures, "View all" first. */}
        {category && category.subs.length > 0 && (
          <nav aria-label={category.name[locale]} className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {[{ slug: "", name: { en: t.listing.viewAll, ar: t.listing.viewAll } }, ...category.subs].map((s) => {
              const active = (activeSub ?? "") === s.slug;
              const image = s.slug ? categoryImages[s.slug] : categoryImages[category.slug];
              return (
                <Link
                  key={s.slug || "all"}
                  href={`/${locale}/category/${category.slug}${s.slug ? `?sub=${s.slug}` : ""}`}
                  aria-current={active ? "page" : undefined}
                  className="flex w-[84px] flex-none flex-col items-center gap-1.5 text-center"
                >
                  <span
                    className={`relative flex size-[76px] items-center justify-center overflow-hidden rounded-full ${category.tint} ${
                      active ? "ring-[3px] ring-navy ring-offset-2" : ""
                    }`}
                  >
                    {image ? (
                      <Image src={image} alt="" fill unoptimized sizes="76px" className="object-cover" />
                    ) : (
                      <CategoryIcon name={category.icon} size={34} />
                    )}
                  </span>
                  <span className={`text-xs leading-tight ${active ? "font-extrabold" : "font-semibold"}`}>{s.name[locale]}</span>
                </Link>
              );
            })}
          </nav>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            aria-haspopup="dialog"
            className="flex h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-line bg-white px-4 text-sm font-extrabold shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="10" cy="17" r="2" />
            </svg>
            {t.listing.filterSort}
            {activeFilters > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] text-white">{activeFilters}</span>
            )}
          </button>
          <p className="text-sm text-muted">{ready && t.listing.results(visible.length)}</p>
        </div>

        <div className="mt-5">
          {!ready || visible.length > 0 ? (
            <ProductGrid products={visible} />
          ) : (
            <p className="rounded-2xl bg-surface p-6 text-center text-ink-soft">{t.listing.empty}</p>
          )}
        </div>
      </div>

      {/* Filter & sort panel (slides up from the bottom). */}
      {panelOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setPanelOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.listing.filterSort}
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white md:inset-x-auto md:end-4 md:bottom-4 md:w-[420px] md:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-line ps-5 pe-2 py-2">
              <h2 className="text-lg font-extrabold">{t.listing.filterSort}</h2>
              <button
                type="button"
                aria-label={t.listing.close}
                onClick={() => setPanelOpen(false)}
                className="flex size-11 cursor-pointer items-center justify-center rounded-xl hover:bg-surface"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex flex-col gap-6 overflow-y-auto p-5">
              <fieldset>
                <legend className="mb-2.5 font-extrabold">{t.listing.sortBy}</legend>
                <div className="flex flex-col">
                  {sorts.map((s) => (
                    <label key={s} className="flex min-h-12 cursor-pointer items-center justify-between border-b border-line text-[15px] font-semibold">
                      {t.listing.sorts[s]}
                      <input type="radio" name="sort" checked={sort === s} onChange={() => setSort(s)} className="size-5 accent-navy" />
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1 font-extrabold">{t.listing.price}</legend>
                <p className="text-sm text-muted">{t.listing.highestPrice(price(maxPrice))}</p>
                {/* Two range inputs stacked on one track = min and max handles. */}
                <div className="relative mt-4 h-6">
                  <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
                  <div
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
                    style={{ insetInlineStart: `${(priceMin / maxPrice) * 100}%`, insetInlineEnd: `${100 - (hiPrice / maxPrice) * 100}%` }}
                  />
                  <input
                    type="range"
                    aria-label={t.listing.priceFrom}
                    min={0}
                    max={maxPrice}
                    value={priceMin}
                    onChange={(e) => setPriceMin(Math.min(Number(e.target.value), hiPrice))}
                    className="dz-range absolute inset-0 w-full"
                  />
                  <input
                    type="range"
                    aria-label={t.listing.priceTo}
                    min={0}
                    max={maxPrice}
                    value={hiPrice}
                    onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                    className="dz-range absolute inset-0 w-full"
                  />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <label className="flex flex-1 items-center gap-2 font-bold">
                    $
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={maxPrice}
                      aria-label={t.listing.priceFrom}
                      value={priceMin}
                      onChange={(e) => setPriceMin(Math.max(0, Math.min(Number(e.target.value) || 0, hiPrice)))}
                      className="h-11 w-full rounded-full bg-surface px-4 font-semibold outline-none focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                  <label className="flex flex-1 items-center gap-2 font-bold">
                    $
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={maxPrice}
                      aria-label={t.listing.priceTo}
                      value={hiPrice}
                      onChange={(e) => setPriceMax(Math.max(priceMin, Math.min(Number(e.target.value) || 0, maxPrice)))}
                      className="h-11 w-full rounded-full bg-surface px-4 font-semibold outline-none focus:ring-2 focus:ring-navy/20"
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2.5 font-extrabold">{t.listing.age}</legend>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setAge("")} className={option(!age)}>
                    {t.listing.all}
                  </button>
                  {ageGroups.map((a) => (
                    <button key={a.slug} type="button" onClick={() => setAge(a.slug)} className={option(age === a.slug)}>
                      <span dir="ltr">{a.label}</span>&nbsp;{a.sub[locale]}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2.5 font-extrabold">{t.listing.gender}</legend>
                <div className="flex flex-wrap gap-2">
                  {(["all", "boy", "girl"] as const).map((g) => (
                    <button key={g} type="button" onClick={() => setGender(g)} className={option(gender === g)}>
                      {g === "boy" ? `👦 ${t.listing.boy}` : g === "girl" ? `👧 ${t.listing.girl}` : t.listing.all}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="flex gap-2.5 border-t border-line p-4">
              <button
                type="button"
                onClick={() => {
                  setSort("newArrivals");
                  setPriceMin(0);
                  setPriceMax(maxPrice);
                  setAge("");
                  setGender("all");
                }}
                className="h-12 flex-1 cursor-pointer rounded-full bg-surface text-sm font-extrabold"
              >
                {t.listing.clear}
              </button>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="h-12 flex-[2] cursor-pointer rounded-full bg-accent text-sm font-extrabold text-white hover:bg-accent-dark"
              >
                {t.listing.showResults(visible.length)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
