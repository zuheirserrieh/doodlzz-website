"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { ChevronIcon, CloseIcon, SearchIcon, SwapIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";
import { AddToCartButton, PriceTag, ProductBadge, ProductGrid, ProductImage, WishButton } from "@/components/product-card";
import { useDict, useStore } from "@/components/store-provider";
import { ageGroups, getCategory, getSubcategory } from "@/data/catalog";
import { whatsappLink } from "@/lib/site";

export function ProductView() {
  const { locale } = useStore();
  const t = useDict();
  const { products, ready, getBySlug } = useCatalog();
  const slug = useSearchParams().get("slug") ?? "";
  const product = getBySlug(slug);
  const [photo, setPhoto] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (product) document.title = `${product.name[locale]} · Doodlzz`;
  }, [product, locale]);

  if (!product) {
    if (!ready) {
      return (
        <div aria-hidden className="mx-auto grid max-w-6xl animate-pulse gap-6 px-4 pt-14 md:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-surface" />
          <div className="flex flex-col gap-3">
            <div className="h-8 w-3/4 rounded bg-surface" />
            <div className="h-6 w-1/4 rounded bg-surface" />
            <div className="h-24 rounded bg-surface" />
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">{t.notFound.title}</h1>
        <p className="text-muted">{t.notFound.text}</p>
        <Link href={`/${locale}/shop`} className="mt-3 flex h-12 items-center rounded-full bg-accent px-6 font-extrabold text-white hover:text-white">
          {t.wishlist.browse}
        </Link>
      </div>
    );
  }

  const category = getCategory(product.category);
  const sub = getSubcategory(product.category, product.subcategory);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id);
  const fill = related.length < 4 ? products.filter((p) => p.category !== product.category && p.bestSeller) : [];
  const ages = ageGroups.filter((a) => product.ages.includes(a.slug));
  const images = product.images ?? [];
  const current = images[Math.min(photo, images.length - 1)];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      {category && (
        <Link href={`/${locale}/category/${category.slug}${sub ? `?sub=${sub.slug}` : ""}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted">
          <ChevronIcon size={16} className="rotate-180 rtl:rotate-0" />
          {t.product.backTo} {sub?.name[locale] ?? category.name[locale]}
        </Link>
      )}

      <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        <div>
          <div className="relative">
            {current ? (
              <button
                type="button"
                onClick={() => setZoom(true)}
                aria-label={t.product.zoom}
                className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl bg-white ring-1 ring-line"
              >
                <Image src={current} alt={product.name[locale]} fill unoptimized sizes="(min-width: 768px) 50vw, 100vw" className="object-contain" />
                <span className="absolute end-3 bottom-3 flex size-11 items-center justify-center rounded-full bg-white shadow-md" aria-hidden>
                  <SearchIcon size={22} />
                </span>
              </button>
            ) : (
              <ProductImage product={product} iconSize={160} className="aspect-square rounded-3xl" />
            )}
            <div className="absolute start-4 top-4">
              <ProductBadge product={product} />
            </div>
            <WishButton productId={product.id} className="absolute end-2 top-2" />
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto p-1">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`${i + 1} / ${images.length}`}
                  aria-current={i === photo ? "true" : undefined}
                  onClick={() => setPhoto(i)}
                  className={`relative aspect-square w-[calc(33.333%-6px)] max-w-32 flex-none cursor-pointer overflow-hidden rounded-xl bg-white ring-2 ${i === photo ? "ring-navy" : "ring-line"}`}
                >
                  <Image src={src} alt="" fill unoptimized sizes="128px" className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-bold text-muted">
              {category?.name[locale]}
              {sub && ` · ${sub.name[locale]}`}
            </p>
            <h1 className="mt-1 font-display text-[28px] leading-tight font-bold md:text-4xl">{product.name[locale]}</h1>
            <PriceTag product={product} className="mt-2 text-2xl" />
          </div>

          {product.description[locale] && (
            <p className="leading-relaxed whitespace-pre-line text-ink-soft">{product.description[locale]}</p>
          )}

          {ages.length > 0 && (
            <div>
              <p className="text-sm font-bold">{t.product.ages}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ages.map((a) => (
                  <Link key={a.slug} href={`/${locale}/shop?age=${a.slug}`} className={`rounded-full px-3 py-1.5 text-[13px] font-bold ${a.tint}`}>
                    <span dir="ltr">{a.label}</span> {a.sub[locale]}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-1">
            <AddToCartButton productId={product.id} className="h-[52px] rounded-full text-base" />
            <a
              href={whatsappLink(t.product.whatsAppMessage(product.name[locale]))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] items-center justify-center gap-2 rounded-full border-2 border-whatsapp text-base font-extrabold text-whatsapp hover:bg-whatsapp hover:text-white"
            >
              <WhatsAppIcon size={22} />
              {t.product.orderWhatsApp}
            </a>
          </div>

          <ul className="mt-1 flex flex-col gap-2 rounded-2xl bg-cream p-4 text-sm font-bold">
            <li className="flex items-center gap-2.5">
              <TruckIcon /> {t.product.delivery}
            </li>
            <li className="flex items-center gap-2.5">
              <SwapIcon /> {t.product.exchange}
            </li>
          </ul>
        </div>
      </div>

      {related.length + fill.length > 0 && (
        <section className="pt-12">
          <h2 className="font-display text-2xl font-bold">{t.product.related}</h2>
          <div className="mt-4">
            <ProductGrid products={[...related, ...fill].slice(0, 4)} />
          </div>
        </section>
      )}
      {zoom && current && (
        <div role="dialog" aria-modal="true" aria-label={product.name[locale]} className="fixed inset-0 z-[60] flex flex-col bg-black/95">
          <div className="flex justify-end p-2">
            <button
              type="button"
              aria-label={t.listing.close}
              onClick={() => setZoom(false)}
              className="flex size-12 cursor-pointer items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <CloseIcon size={28} />
            </button>
          </div>
          <div className="relative flex-1" onClick={() => setZoom(false)}>
            <Image src={current} alt={product.name[locale]} fill unoptimized sizes="100vw" className="object-contain" />
          </div>
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-4 p-4 text-white">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => setPhoto((p) => (p - 1 + images.length) % images.length)}
                className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/15"
              >
                <ChevronIcon className="rotate-180 rtl:rotate-0" />
              </button>
              <span className="text-sm font-bold" dir="ltr">
                {(photo % images.length) + 1} / {images.length}
              </span>
              <button
                type="button"
                aria-label="Next"
                onClick={() => setPhoto((p) => (p + 1) % images.length)}
                className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/15"
              >
                <ChevronIcon className="rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
