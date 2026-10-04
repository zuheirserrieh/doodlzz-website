import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronIcon, SwapIcon, TruckIcon, WhatsAppIcon } from "@/components/icons";
import { AddToCartButton, Price, ProductBadge, ProductGrid, ProductImage, WishButton } from "@/components/product-card";
import { ageGroups, getCategory } from "@/data/catalog";
import { getProduct, products } from "@/data/products";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { whatsappLink } from "@/lib/site";

// Only the pages generated at build time exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/product/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!isLocale(locale) || !product) return {};
  return { title: product.name[locale], description: product.description[locale] };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/product/[slug]">) {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!isLocale(locale) || !product) notFound();
  const t = getDictionary(locale);
  const category = getCategory(product.category);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id);
  const fill = related.length < 4 ? products.filter((p) => p.category !== product.category && p.bestSeller) : [];
  const ages = ageGroups.filter((a) => product.ages.includes(a.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      {category && (
        <Link href={`/${locale}/category/${category.slug}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted">
          <ChevronIcon size={16} className="rotate-180 rtl:rotate-0" />
          {t.product.backTo} {category.name[locale]}
        </Link>
      )}

      <div className="mt-2 grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="relative">
          <ProductImage product={product} iconSize={160} className="aspect-square rounded-3xl" />
          <div className="absolute start-4 top-4">
            <ProductBadge product={product} />
          </div>
          <WishButton productId={product.id} className="absolute end-2 top-2" />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-bold text-muted">{category?.name[locale]}</p>
            <h1 className="mt-1 font-display text-[28px] leading-tight font-semibold md:text-4xl">{product.name[locale]}</h1>
            <p className="mt-2 text-2xl font-extrabold">
              <Price usd={product.priceUsd} />
            </p>
          </div>

          <p className="leading-relaxed text-ink-soft">{product.description[locale]}</p>

          {ages.length > 0 && (
            <div>
              <p className="text-sm font-bold">{t.product.ages}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ages.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/${locale}/shop?age=${a.slug}`}
                    className={`rounded-full px-3 py-1.5 text-[13px] font-bold ${a.tint}`}
                  >
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

      <section className="pt-12">
        <h2 className="font-display text-2xl font-semibold">{t.product.related}</h2>
        <div className="mt-4">
          <ProductGrid products={[...related, ...fill].slice(0, 4)} />
        </div>
      </section>
    </div>
  );
}
