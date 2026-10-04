"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AgeIcon, ArrowIcon, BagIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-card";
import { useDict, usePrice, useStore } from "@/components/store-provider";
import { ageGroups, getCategory } from "@/data/catalog";
import { products } from "@/data/products";

/** Blue tabbed panel: pick an age, swipe through the matching products. */
export function ShopByAge({ title }: { title?: string }) {
  const { locale, addToCart } = useStore();
  const t = useDict();
  const price = usePrice();
  const [active, setActive] = useState(ageGroups[0].slug);
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const list = products.filter((p) => p.ages.includes(active));
  const age = ageGroups.find((a) => a.slug === active)!;

  function selectAge(slug: string) {
    setActive(slug);
    setSlide(0);
    trackRef.current?.scrollTo({ left: 0 });
  }

  function onScroll() {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    // scrollLeft is negative in RTL, hence abs().
    setSlide(Math.round(Math.abs(track.scrollLeft) / (card.offsetWidth + 12)));
  }

  return (
    <section id="shop-by-age" className="mx-auto max-w-6xl scroll-mt-28 px-4 pt-10">
      <div className="rounded-[28px] bg-sky p-3 pt-5 md:p-5">
        <h2
          className="px-2 font-display text-[28px] font-semibold text-white"
          style={{ textShadow: "0 2px 0 #1E2742, 2px 0 0 #1E2742, -2px 0 0 #1E2742, 0 -2px 0 #1E2742, 0 4px 0 #1E2742" }}
        >
          {title ?? t.age.title}
        </h2>

        <div role="tablist" aria-label={t.age.title} className="no-scrollbar mt-4 flex items-end gap-2 overflow-x-auto">
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
                className={`flex flex-none cursor-pointer items-center gap-2 py-2 ps-2 pe-4 transition-colors ${
                  selected
                    ? "rounded-t-[22px] bg-white pb-4 text-navy"
                    : "mb-2 rounded-full bg-sky-dark text-white hover:bg-sky-darker"
                }`}
              >
                <span className={`flex size-12 items-center justify-center rounded-full bg-white ${selected ? "ring-2 ring-line" : ""}`}>
                  <AgeIcon slug={a.slug} />
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span dir="ltr" className="text-lg font-extrabold">{a.label}</span>
                  <span className="text-[13px] font-semibold">{a.unit === "months" ? t.age.months : t.age.years}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          id="age-panel"
          role="tabpanel"
          aria-labelledby={`age-tab-${active}`}
          className={`rounded-[22px] bg-white p-3 ${active === ageGroups[0].slug ? "rounded-ss-none" : ""}`}
        >
          {list.length === 0 ? (
            <p className="px-2 py-10 text-center text-sm text-muted">{t.age.empty}</p>
          ) : (
            <div ref={trackRef} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto">
              {list.map((p) => (
                <article
                  key={p.id}
                  className="flex w-[calc(50%-6px)] flex-none snap-start flex-col rounded-[18px] border border-line p-3 md:w-[calc(25%-9px)]"
                >
                  <Link href={`/${locale}/product/${p.slug}`} tabIndex={-1} aria-hidden>
                    <ProductImage product={p} iconSize={56} className="aspect-square rounded-xl" />
                  </Link>
                  <span className="mt-3 text-xs text-muted">{getCategory(p.category)?.shortName[locale]}</span>
                  <Link href={`/${locale}/product/${p.slug}`} className="mt-1 line-clamp-2 min-h-[2.6em] text-sm leading-[1.3] font-extrabold">
                    {p.name[locale]}
                  </Link>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="text-base font-extrabold">{price(p.priceUsd)}</span>
                    <button
                      type="button"
                      aria-label={`${t.product.addToCart}: ${p.name[locale]}`}
                      onClick={() => addToCart(p.id)}
                      className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full bg-sky text-white hover:bg-sky-dark"
                    >
                      <BagIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5" aria-hidden>
              {list.map((p, i) => (
                <span
                  key={p.id}
                  className={`block h-2 rounded-full transition-all ${i === slide ? "w-5 bg-sky" : "w-2 border-2 border-sky"}`}
                />
              ))}
            </div>
            <Link
              href={`/${locale}/shop?age=${age.slug}`}
              className="flex h-12 flex-none items-center gap-2 rounded-full bg-accent px-5 text-[15px] font-extrabold text-white hover:bg-accent-dark hover:text-white"
            >
              {t.age.viewAll}
              <ArrowIcon className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
