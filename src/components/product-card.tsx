"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getCategory, getSubcategory } from "@/data/catalog";
import type { Product } from "@/data/products";
import { CategoryIcon, HeartIcon } from "@/components/icons";
import { useCatalog } from "@/components/catalog-provider";
import { useDict, usePrice, useStore } from "@/components/store-provider";
import { photosOf } from "@/lib/media";
import type { Locale } from "@/lib/i18n";

/** Product pages use a query string so new products work without rebuilding the static site. */
export function productHref(locale: Locale, slug: string) {
  return `/${locale}/product?slug=${encodeURIComponent(slug)}`;
}

/**
 * Product photo. With `cycle`, products that have several photos flip through them on their
 * own (only while visible on screen, and not for people who prefer reduced motion).
 */
export function ProductImage({
  product,
  className = "",
  iconSize = 72,
  cycle = false,
}: {
  product: Product;
  className?: string;
  iconSize?: number;
  cycle?: boolean;
}) {
  const category = getCategory(product.category);
  const images = photosOf(product.images); // cards never autoplay videos
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const canCycle = cycle && images.length > 1;

  useEffect(() => {
    const el = ref.current;
    if (!canCycle || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = setInterval(() => setIndex((i) => (i + 1) % images.length), 2800);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [canCycle, images.length]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${category?.tint ?? "bg-surface"} ${className}`}>
      {images.length > 0 ? (
        (canCycle ? images : images.slice(0, 1)).map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 768px) 25vw, 50vw"
            className={`object-cover transition-opacity duration-700 ${i === index % images.length ? "opacity-100" : "opacity-0"}`}
          />
        ))
      ) : (
        // Placeholder until the product has photos.
        <div className="flex size-full items-center justify-center text-navy/25">
          {category && <CategoryIcon name={category.icon} size={iconSize} strokeWidth={1.4} />}
        </div>
      )}
    </div>
  );
}

export function ProductBadge({ product }: { product: Product }) {
  const t = useDict();
  // Urgency label first ("Last piece" beats "Limited quantity"), then Best seller / New.
  const urgent = product.lastPiece
    ? { text: t.product.badgeLastPiece, cls: "bg-accent text-white" }
    : product.limitedQuantity
      ? { text: t.product.badgeLimited, cls: "bg-[#F59E0B] text-navy" }
      : null;
  const label = product.bestSeller ? t.product.badgeBest : product.isNew ? t.product.badgeNew : null;
  if (!urgent && !label) return null;
  const pill = "w-fit rounded-full px-[9px] py-1 text-[11px] font-extrabold";
  return (
    <span className="flex flex-col items-start gap-1">
      {urgent && <span className={`${pill} ${urgent.cls}`}>{urgent.text}</span>}
      {label && <span className={`${pill} bg-badge text-navy`}>{label}</span>}
    </span>
  );
}

/** Heart toggle. Favorites are kept in the browser until accounts exist. */
export function WishButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { isWished, toggleWish } = useStore();
  const t = useDict();
  const on = isWished(productId);
  return (
    <button
      type="button"
      aria-label={t.product.addToWishlist}
      aria-pressed={on}
      onClick={() => toggleWish(productId)}
      className={`flex size-11 cursor-pointer items-center justify-center ${className}`}
    >
      <span className={`flex size-8 items-center justify-center rounded-full bg-white ${on ? "text-accent" : "text-navy"}`}>
        <HeartIcon fill={on ? "currentColor" : "none"} />
      </span>
    </button>
  );
}

export function Price({ usd }: { usd: number }) {
  return <>{usePrice()(usd)}</>;
}

/** Price, plus the old price crossed out when the product is on sale. */
export function PriceTag({ product, className = "" }: { product: Product; className?: string }) {
  const price = usePrice();
  const onSale = product.compareAtUsd != null && product.compareAtUsd > product.priceUsd;
  return (
    <span className={`flex flex-wrap items-baseline gap-x-2 font-extrabold ${className}`}>
      <span className={onSale ? "text-accent" : ""}>{price(product.priceUsd)}</span>
      {onSale && <s className="text-[0.85em] font-bold text-muted">{price(product.compareAtUsd!)}</s>}
    </span>
  );
}

export function AddToCartButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { addToCart } = useStore();
  const t = useDict();
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        addToCart(productId);
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
      className={`cursor-pointer rounded-xl bg-accent font-extrabold text-white transition-colors hover:bg-accent-dark ${className}`}
    >
      <span aria-live="polite">{added ? t.product.added : t.product.addToCart}</span>
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { locale } = useStore();
  const category = getCategory(product.category);
  const href = productHref(locale, product.slug);

  return (
    <article className="flex min-w-0 flex-col gap-1.5">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden>
          <ProductImage product={product} cycle className="aspect-square rounded-[18px]" />
        </Link>
        <div className="absolute start-2.5 top-2.5">
          <ProductBadge product={product} />
        </div>
        <WishButton productId={product.id} className="absolute end-0.5 top-0.5" />
      </div>
      <Link href={href} className="mt-1 min-h-[38px] text-sm font-bold leading-[1.35]">
        {product.name[locale]}
      </Link>
      <div className="text-xs text-muted">{getSubcategory(product.category, product.subcategory)?.name[locale] ?? category?.name[locale]}</div>
      <PriceTag product={product} className="text-base" />
      <AddToCartButton productId={product.id} className="mt-1 h-11 text-sm" />
    </article>
  );
}

export function ProductGrid({ products, skeletons = 4 }: { products: Product[]; skeletons?: number }) {
  const { ready } = useCatalog();
  return (
    <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
      {ready
        ? products.map((p) => <ProductCard key={p.id} product={p} />)
        : Array.from({ length: skeletons }, (_, i) => <ProductSkeleton key={i} />)}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-2">
      <div className="aspect-square rounded-[18px] bg-surface" />
      <div className="h-4 w-4/5 rounded bg-surface" />
      <div className="h-3 w-1/2 rounded bg-surface" />
      <div className="h-11 rounded-xl bg-surface" />
    </div>
  );
}
