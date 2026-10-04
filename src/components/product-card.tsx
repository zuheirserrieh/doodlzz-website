"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getCategory } from "@/data/catalog";
import type { Product } from "@/data/products";
import { CategoryIcon, HeartIcon } from "@/components/icons";
import { useCatalog } from "@/components/catalog-provider";
import { useDict, usePrice, useStore } from "@/components/store-provider";
import type { Locale } from "@/lib/i18n";

/** Product pages use a query string so new products work without rebuilding the static site. */
export function productHref(locale: Locale, slug: string) {
  return `/${locale}/product?slug=${encodeURIComponent(slug)}`;
}

export function ProductImage({ product, className = "", iconSize = 72 }: { product: Product; className?: string; iconSize?: number }) {
  const category = getCategory(product.category);
  return (
    <div className={`relative overflow-hidden ${category?.tint ?? "bg-surface"} ${className}`}>
      {product.images?.[0] ? (
        <Image src={product.images[0]} alt="" fill unoptimized sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
      ) : (
        // Placeholder until the owner sends real photos.
        <div className="flex size-full items-center justify-center text-navy/25">
          {category && <CategoryIcon name={category.icon} size={iconSize} strokeWidth={1.4} />}
        </div>
      )}
    </div>
  );
}

export function ProductBadge({ product }: { product: Product }) {
  const t = useDict();
  const label = product.bestSeller ? t.product.badgeBest : product.isNew ? t.product.badgeNew : null;
  if (!label) return null;
  return (
    <span className="rounded-full bg-badge px-[9px] py-1 text-[11px] font-extrabold text-navy">{label}</span>
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
          <ProductImage product={product} className="aspect-square rounded-[18px]" />
        </Link>
        <div className="absolute start-2.5 top-2.5">
          <ProductBadge product={product} />
        </div>
        <WishButton productId={product.id} className="absolute end-0.5 top-0.5" />
      </div>
      <Link href={href} className="mt-1 min-h-[38px] text-sm font-bold leading-[1.35]">
        {product.name[locale]}
      </Link>
      <div className="text-xs text-muted">{category?.name[locale]}</div>
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
