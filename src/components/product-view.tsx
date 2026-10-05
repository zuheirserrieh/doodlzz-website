"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { ChevronIcon, SwapIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";
import { AddToCartButton, PriceTag, ProductBadge, ProductGrid, ProductImage, WishButton } from "@/components/product-card";
import { useDict, useStore } from "@/components/store-provider";
import { ageGroups, getCategory } from "@/data/catalog";
import { whatsappLink } from "@/lib/site";

export function ProductView() {
  const { locale } = useStore();
  const t = useDict();
  const { products, ready, getBySlug } = useCatalog();
  const slug = useSearchParams().get("slug") ?? "";
  const product = getBySlug(slug);
  const [photo, setPhoto] = useState(0);

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
  const related = products.filter((p) => p.category === product.category && p.id !== product.id);
  const fill = related.length < 4 ? products.filter((p) => p.category !== product.category && p.bestSeller) : [];
  const ages = ageGroups.filter((a) => product.ages.includes(a.slug));
  const images = product.images ?? [];
  const current = images[Math.min(photo, images.length - 1)];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      {category && (
        <Link href={`/${locale}/category/${category.slug}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted">
          <ChevronIcon size={16} className="rotate-180 rtl:rotate-0" />
          {t.product.backTo} {category.name[locale]}
        </Link>
      )}

      <div className="mt-2 grid gap-6 md:grid-cols-2 md:gap-10">
        <div>
          <div className="relative">
            {current ? (
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface">
                <Image src={current} alt={product.name[locale]} fill unoptimized sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
            ) : (
              <ProductImage product={product} iconSize={160} className="aspect-square rounded-3xl" />
            )}
            <div className="absolute start-4 top-4">
              <ProductBadge product={product} />
            </div>
            <WishButton productId={product.id} className="absolute end-2 top-2" />
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`${i + 1} / ${images.length}`}
                  aria-current={i === photo ? "true" : undefined}
                  onClick={() => setPhoto(i)}
                  className={`relative size-16 flex-none cursor-pointer overflow-hidden rounded-xl ring-2 ${i === photo ? "ring-navy" : "ring-transparent"}`}
                >
                  <Image src={src} alt="" fill unoptimized sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-bold text-muted">{category?.name[locale]}</p>
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
                    <span dir="ltr">{a.label}</span> {a.unit === "months" ? t.age.months : t.age.years}
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
    </div>
  );
}
