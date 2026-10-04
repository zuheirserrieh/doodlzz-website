import Link from "next/link";
import { ageGroups, categories } from "@/data/catalog";
import {
  CategoryIcon,
  FacebookIcon,
  InstagramIcon,
  SearchIcon,
  StarIcon,
  TikTokIcon,
} from "@/components/icons";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

const h2 = "font-display text-2xl font-semibold";

export function SearchBar({ locale, defaultValue = "" }: { locale: Locale; defaultValue?: string }) {
  const t = getDictionary(locale);
  return (
    <form action={`/${locale}/shop`} role="search" className="mx-auto max-w-6xl px-4 pt-3 pb-2">
      <label htmlFor="dz-search" className="sr-only">
        {t.search.label}
      </label>
      <div className="flex h-12 items-center gap-2.5 rounded-full bg-surface px-4 text-muted focus-within:outline-2 focus-within:outline-accent">
        <SearchIcon />
        <input
          id="dz-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={t.search.placeholder}
          className="h-11 flex-1 bg-transparent text-[15px] font-semibold text-navy outline-none placeholder:text-muted"
        />
      </div>
    </form>
  );
}

export function ShopByAge({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section id="shop-by-age" className="mx-auto max-w-6xl scroll-mt-28 pt-3 pb-4">
      <h2 className="px-4 font-display text-xl font-semibold">{t.age.title}</h2>
      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4">
        {ageGroups.map((a) => (
          <Link
            key={a.slug}
            href={`/${locale}/shop?age=${a.slug}`}
            className="flex w-[72px] flex-none flex-col items-center gap-1.5"
          >
            <span
              dir="ltr"
              className={`flex size-[68px] items-center justify-center rounded-full font-display text-xl font-semibold ${a.tint}`}
            >
              {a.label}
            </span>
            <span className="text-xs font-bold">{a.unit === "months" ? t.age.months : t.age.years}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

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
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5 lg:grid-cols-9">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/${locale}/category/${c.slug}`}
            className={`flex h-28 flex-col items-center justify-center gap-2 rounded-[18px] p-2 text-center hover:text-navy hover:brightness-[0.97] ${c.tint}`}
          >
            <CategoryIcon name={c.icon} />
            <span className="text-[13px] font-bold leading-tight">{c.shortName[locale]}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// TODO(owner): real customer photos + review lines.
const placeholderQuote = { en: "[One line from the customer's review]", ar: "[جملة من تقييم الزبون]" };
const moments = [
  { tint: "bg-pastel-blue", stars: 5, quote: placeholderQuote, who: "[Customer name] · [Product]" },
  { tint: "bg-pastel-peach", stars: 5, quote: placeholderQuote, who: "[Customer name] · [Product]" },
  { tint: "bg-pastel-yellow", stars: 5, quote: placeholderQuote, who: "[Customer name] · [Product]" },
];

export function RealMoments({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="mx-auto max-w-6xl pt-11">
      <div className="px-4">
        <h2 className={h2}>{t.moments.title}</h2>
        <p className="mt-1.5 text-sm text-muted">{t.moments.subtitle}</p>
      </div>
      <div className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scroll-px-4">
        {moments.map((m, i) => (
          <figure
            key={i}
            className={`relative flex h-[340px] w-[270px] flex-none snap-start items-center justify-center rounded-[22px] ${m.tint}`}
          >
            <span className="text-xs font-semibold text-muted">[Customer photo]</span>
            <figcaption className="absolute inset-x-3 bottom-3 flex flex-col gap-1 rounded-2xl bg-white px-3.5 py-3">
              <span className="flex gap-0.5 text-star" role="img" aria-label={t.moments.stars(m.stars)}>
                {Array.from({ length: m.stars }, (_, s) => (
                  <StarIcon key={s} />
                ))}
              </span>
              <span className="text-sm font-bold leading-[1.35]">{m.quote[locale]}</span>
              <span className="text-xs text-muted">{m.who}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// TODO(owner): brand logos (put files in /public/brands and render <Image> here).
const brands = Array.from({ length: 8 }, () => "[Brand logo]");

export function BrandsMarquee({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section className="mx-auto max-w-6xl pt-11">
      <h2 className="px-4 font-display text-xl font-semibold">{t.brands.title}</h2>
      <div dir="ltr" className="mt-3.5 overflow-hidden">
        {/* The list is rendered twice so the -50% loop is seamless. */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...brands, ...brands].map((b, i) => (
            <span
              key={i}
              aria-hidden={i >= brands.length}
              className="ms-3 flex h-16 w-[120px] items-center justify-center rounded-[14px] border border-[#e3e7ee] px-2 text-center text-xs font-bold text-muted"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FollowUs({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const links = [
    { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
  ];
  return (
    <section className="mx-4 mt-11 flex flex-col items-center gap-1.5 rounded-3xl bg-navy px-5 py-7 text-center text-white md:mx-auto md:max-w-3xl">
      <h2 className="font-display text-[22px] font-semibold">{t.follow.title}</h2>
      <p className="text-sm text-[#c9cfdc]">{t.follow.subtitle}</p>
      <div className="mt-4 flex gap-5">
        {links.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 text-xs font-bold text-white hover:text-badge"
          >
            <span className="flex size-[52px] items-center justify-center rounded-full bg-white text-navy">
              <Icon />
            </span>
            {label}
          </a>
        ))}
      </div>
      <span dir="ltr" className="mt-2.5 text-[13px] font-bold text-badge">
        {site.social.handle}
      </span>
    </section>
  );
}
