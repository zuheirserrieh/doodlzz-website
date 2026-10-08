"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { ScrollArrows } from "@/components/scroll-row";
import { AgeIcon, ArrowIcon, PlusIcon } from "@/components/icons";
import { PriceTag, ProductImage, productHref, useQuickAdd } from "@/components/product-card";
import { useDict, useStore } from "@/components/store-provider";
import { ageGroups } from "@/data/catalog";

/** Pick an age, then swipe through the matching products. */
export function ShopByAge({ title }: { title?: string }) {
  const { locale } = useStore();
  const quickAdd = useQuickAdd();
  const t = useDict();
  const { products, ready } = useCatalog();
  const [active, setActive] = useState(ageGroups[0].slug);
  const [progress, setProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const list = products.filter((p) => p.ages.includes(active));
  const age = ageGroups.find((a) => a.slug === active)!;

  function selectAge(slug: string) {
    setActive(slug);
    setProgress(0);
    trackRef.current?.scrollTo({ left: 0 });
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    // scrollLeft is negative in RTL, hence abs().
    setProgress(max > 0 ? Math.abs(track.scrollLeft) / max : 0);
  }

  return (
    <section id="shop-by-age" className="mx-auto max-w-6xl scroll-mt-28 px-4 pt-10">
      <div className="rounded-[28px] border border-line bg-cream p-4 md:p-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">{title ?? t.age.title}</h2>
          <Link href={`/${locale}/shop?age=${age.slug}`} className="flex items-center gap-1 text-sm font-bold text-accent">
            {t.age.viewAll}
            <ArrowIcon size={16} className="rtl:rotate-180" />
          </Link>
        </div>

        {/* Age picker: square tiles, one pastel colour per age. */}
        <div role="tablist" aria-label={t.age.title} className="no-scrollbar -mx-1 mt-4 flex gap-2.5 overflow-x-auto px-1 pb-1.5">
          {ageGroups.map((a) => {
            const selected = a.slug === active;
            return (
              <button
                key={a.slug}
                type="button"
                role="tab"
                id={`age-tab-${a.slug}`}
                aria-selected={selected}
                aria-controls="age-panel"
                onClick={() => selectAge(a.slug)}
                className={`flex w-[76px] flex-none cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 px-1 pt-2.5 pb-2 transition ${a.tint} ${
                  selected ? "border-navy shadow-[0_4px_0_#1E2742]" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <AgeIcon slug={a.slug} size={34} />
                <span dir="ltr" className="text-[15px] leading-tight font-extrabold">
                  {a.label}
                </span>
                <span className="text-[11px] leading-tight font-bold text-ink-soft">{a.sub[locale]}</span>
              </button>
            );
          })}
        </div>

        <div id="age-panel" role="tabpanel" aria-labelledby={`age-tab-${active}`} className="mt-4">
          {ready && list.length === 0 ? (
            <p className="rounded-2xl bg-white px-2 py-10 text-center text-sm text-muted">{t.age.empty}</p>
          ) : (
            <div className="relative">
            <div ref={trackRef} onScroll={onScroll} className="no-scrollbar flex items-start snap-x snap-mandatory gap-3 overflow-x-auto">
              {list.map((p) => (
                <article
                  key={p.id}
                  className="flex w-[calc(50%-6px)] flex-none snap-start flex-col overflow-hidden rounded-2xl bg-white md:w-[calc(25%-9px)]"
                >
                  <Link href={productHref(locale, p.slug)} tabIndex={-1} aria-hidden>
                    <ProductImage product={p} iconSize={56} cycle className="aspect-square" />
                  </Link>
                  <div className="flex flex-col p-3">
                    <Link href={productHref(locale, p.slug)} className="line-clamp-2 text-sm leading-[1.3] font-bold">
                      {p.name[locale]}
                    </Link>
                    <div className="flex items-center justify-between gap-1 pt-1.5">
                      <PriceTag product={p} className="text-base" />
                      <button
                        type="button"
                        aria-label={`${t.product.addToCart}: ${p.name[locale]}`}
                        onClick={() => quickAdd(p.id)}
                        className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-dark"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <ScrollArrows key={active} target={trackRef} />
            </div>
          )}
          {list.length > 2 && (
            <div aria-hidden className="mx-auto mt-4 h-1.5 w-24 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-navy transition-[width]" style={{ width: `${Math.max(20, progress * 100)}%` }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
