"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { ChevronIcon, CloseIcon, MinusIcon, PaymentIcon, PlusIcon, SearchIcon, TruckIcon } from "@/components/icons";
import { PriceTag, ProductBadge, ProductGrid, ProductImage, WishButton } from "@/components/product-card";
import { useDict, useStore } from "@/components/store-provider";
import { ageGroups, getCategory, getColor, getSubcategory } from "@/data/catalog";
import { isVideo } from "@/lib/media";

export function ProductView() {
  const { locale, addToCart } = useStore();
  const other = locale === "ar" ? "en" : "ar";
  const [addedAll, setAddedAll] = useState(false);
  const t = useDict();
  const { products, ready, getBySlug } = useCatalog();
  const slug = useSearchParams().get("slug") ?? "";
  const product = getBySlug(slug);
  const [photo, setPhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();
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
  // Items the owner linked to this product in the admin panel ("Goes well with").
  const goesWith = (product.related ?? []).map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const images = product.images ?? [];
  const current = images[Math.min(photo, images.length - 1)];

  return (
    <div className="mx-3 mt-3 max-w-6xl rounded-3xl bg-white/90 p-3 shadow-sm sm:mx-4 md:mx-auto md:p-6">
      {category && (
        <Link href={`/${locale}/category/${category.slug}${sub ? `?sub=${sub.slug}` : ""}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted">
          <ChevronIcon size={16} className="rotate-180 rtl:rotate-0" />
          {t.product.backTo} {sub?.name[locale] ?? category.name[locale]}
        </Link>
      )}

      <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        <div>
          <div className="relative">
            {current && isVideo(current) ? (
              <div className="aspect-square w-full overflow-hidden rounded-3xl bg-black">
                <video key={current} src={current} controls playsInline preload="metadata" className="size-full object-contain" />
              </div>
            ) : current ? (
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
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => setPhoto((p) => (p - 1 + images.length) % images.length)}
                  className="absolute start-2 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
                >
                  <ChevronIcon size={22} strokeWidth={2.6} className="rotate-180 rtl:rotate-0" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => setPhoto((p) => (p + 1) % images.length)}
                  className="absolute end-2 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
                >
                  <ChevronIcon size={22} strokeWidth={2.6} className="rtl:rotate-180" />
                </button>
              </>
            )}
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
                  {isVideo(src) ? (
                    <>
                      <video src={`${src}#t=0.5`} muted playsInline preload="metadata" className="pointer-events-none size-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-navy/25 text-2xl text-white" aria-hidden>
                        ▶
                      </span>
                    </>
                  ) : (
                    <Image src={src} alt="" fill unoptimized sizes="128px" className="object-contain" />
                  )}
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
            {/* Same title in the other language (shown when the owner entered both). */}
            {product.name[other] !== product.name[locale] && (
              <p lang={other} dir={other === "ar" ? "rtl" : "ltr"} className="mt-1 text-lg font-bold text-ink-soft">
                {product.name[other]}
              </p>
            )}
            <PriceTag product={product} className="mt-2 text-2xl" />
          </div>

          {(product.brand || (product.colors?.length ?? 0) > 0) && (
            <dl className="flex flex-col gap-2.5 text-sm">
              {product.brand && (
                <div className="flex items-center gap-2">
                  <dt className="font-bold text-muted">{t.product.brand}:</dt>
                  <dd className="font-extrabold">{product.brand}</dd>
                </div>
              )}
              {(product.colors?.length ?? 0) > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <dt className="font-bold text-muted">{t.product.colors}:</dt>
                  {product.colors!.map((slug) => {
                    const c = getColor(slug);
                    if (!c) return null;
                    return (
                      <dd key={slug} className="flex items-center gap-1.5 rounded-full border border-line bg-white py-1 ps-1 pe-3 font-bold">
                        <span className="size-5 rounded-full ring-1 ring-black/15" style={{ background: c.hex }} aria-hidden />
                        {c.name[locale]}
                      </dd>
                    );
                  })}
                </div>
              )}
            </dl>
          )}

          <DescriptionCard en={product.description.en} ar={product.description.ar} locale={locale} />

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
            <div className="flex gap-2.5">
              <div
                role="group"
                aria-label={t.cart.quantity}
                className="flex h-[52px] w-[92px] flex-none overflow-hidden rounded-full border-2 border-brand-blue bg-white"
              >
                <span className="flex flex-1 items-center justify-center text-lg font-extrabold" aria-live="polite">
                  {qty}
                </span>
                <span className="flex w-10 flex-col border-s-2 border-brand-blue">
                  <button
                    type="button"
                    aria-label={t.cart.increase}
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    className="flex flex-1 cursor-pointer items-center justify-center bg-brand-blue-soft/50 hover:bg-brand-blue-soft"
                  >
                    <PlusIcon size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label={t.cart.decrease}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex flex-1 cursor-pointer items-center justify-center border-t-2 border-brand-blue bg-brand-blue-soft/50 hover:bg-brand-blue-soft"
                  >
                    <MinusIcon size={15} />
                  </button>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  addToCart(product.id, qty);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1400);
                }}
                className="h-[52px] flex-1 cursor-pointer rounded-full border-2 border-accent bg-white text-base font-extrabold text-accent hover:bg-accent/5"
              >
                <span aria-live="polite">{added ? t.product.added : t.product.addToCart}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                addToCart(product.id, qty);
                router.push(`/${locale}/checkout`);
              }}
              className="h-[52px] cursor-pointer rounded-full bg-gradient-to-r from-accent to-[#ff7a59] text-base font-extrabold text-white shadow-[0_6px_16px_rgba(235,70,81,0.3)] hover:brightness-105"
            >
              {t.product.buyNow}
            </button>
          </div>

          <ul className="mt-1 flex flex-col gap-2.5 rounded-2xl border border-brand-blue bg-brand-blue/35 p-4 text-[15px] font-extrabold text-navy backdrop-blur-sm">
            <li className="flex items-center gap-2.5">
              <TruckIcon /> {t.product.delivery}
            </li>
            <li className="flex items-center gap-2.5">
              <PaymentIcon /> {t.product.paymentLine}
            </li>
          </ul>
        </div>
      </div>

      {goesWith.length > 0 && (
        <section className="mt-10 rounded-3xl bg-pastel-blue p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">{t.product.goesWellWith}</h2>
            <button
              type="button"
              onClick={() => {
                [product, ...goesWith].forEach((p) => addToCart(p.id));
                setAddedAll(true);
                setTimeout(() => setAddedAll(false), 1600);
              }}
              className="h-11 cursor-pointer rounded-full bg-accent px-5 text-sm font-extrabold text-white hover:bg-accent-dark"
            >
              <span aria-live="polite">{addedAll ? t.product.addedAll : t.product.addAll(goesWith.length + 1)}</span>
            </button>
          </div>
          <div className="mt-4">
            <ProductGrid products={goesWith} />
          </div>
        </section>
      )}

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
            {isVideo(current) ? (
              <video key={current} src={current} controls playsInline className="absolute inset-0 size-full object-contain" onClick={(e) => e.stopPropagation()} />
            ) : (
              <Image src={current} alt={product.name[locale]} fill unoptimized sizes="100vw" className="object-contain" />
            )}
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

/** Product description in one card; English / العربية tabs when both languages were entered. */
function DescriptionCard({ en, ar, locale }: { en: string; ar: string; locale: "en" | "ar" }) {
  const both = Boolean(en && ar && en !== ar);
  const [lang, setLang] = useState<"en" | "ar">(locale);
  const text = both ? (lang === "ar" ? ar : en) : en || ar;
  if (!text) return null;
  const textLang = both ? lang : en ? "en" : "ar";
  return (
    <section className="rounded-2xl border border-line bg-surface/70">
      {both && (
        <div role="tablist" className="flex gap-1 border-b border-line p-1.5">
          {(["en", "ar"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className={`h-9 flex-1 cursor-pointer rounded-xl text-sm font-extrabold ${lang === l ? "bg-white text-navy shadow-sm" : "text-muted"}`}
            >
              {l === "en" ? "English" : "العربية"}
            </button>
          ))}
        </div>
      )}
      <p lang={textLang} dir={textLang === "ar" ? "rtl" : "ltr"} className="p-4 leading-relaxed whitespace-pre-line text-ink-soft">
        {text}
      </p>
    </section>
  );
}
