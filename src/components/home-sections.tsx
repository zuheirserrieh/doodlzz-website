import Link from "next/link";
import { CategoryTile } from "@/components/category-tile";
import { categories } from "@/data/catalog";
import { getDictionary, type Locale } from "@/lib/i18n";

const h2 = "font-display text-2xl font-semibold";

export function CategoryGrid({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8">
      <div className="flex items-baseline justify-between">
        <h2 className={h2}>{t.catalog.title}</h2>
        <Link href={`/${locale}/shop`} className="text-sm font-bold text-accent">
          {t.catalog.viewAll}
        </Link>
      </div>
      {/* Two rows that swipe sideways, so every category is reachable from the home page. */}
      <div className="no-scrollbar -mx-4 mt-4 grid snap-x snap-mandatory auto-cols-[108px] grid-flow-col grid-rows-2 gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 md:auto-cols-[132px]">
        {categories.map((c) => (
          <CategoryTile key={c.slug} category={c} locale={locale} />
        ))}
      </div>
    </section>
  );
}

/** Brand separator artwork from the owner (public/brand/separator.jpg), cropped to the illustrated band. */
export function WavySeparator() {
  return (
    <div aria-hidden className="mx-auto mt-10 max-w-6xl overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- static decorative image */}
      <img
        src="/brand/separator.jpg"
        alt=""
        width={1051}
        height={374}
        className="aspect-[1051/190] w-full object-cover object-center"
      />
    </div>
  );
}
