import Link from "next/link";
import { CategoryTile } from "@/components/category-tile";
import { categories } from "@/data/catalog";
import {
  FacebookIcon,
  InstagramIcon,
  StarIcon,
  TikTokIcon,
} from "@/components/icons";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

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
      <h2 className="px-4 font-display text-xl font-bold">{t.brands.title}</h2>
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

// TODO(owner): replace with real Instagram posts (put images in /public/social and render <Image>).
const feedTints = ["bg-pastel-peach", "bg-pastel-blue", "bg-pastel-yellow", "bg-pastel-mint", "bg-pastel-lilac", "bg-pastel-peach"];

export function FollowUs({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const links = [
    { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
  ];
  return (
    <section className="mx-4 mt-11 flex flex-col items-center gap-1.5 rounded-3xl bg-navy px-4 py-7 text-center text-white md:mx-auto md:max-w-3xl">
      <h2 className="font-display text-[22px] font-bold">{t.follow.title}</h2>
      <p className="text-sm text-[#c9cfdc]">{t.follow.subtitle}</p>

      <a
        href={site.social.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram ${site.social.handle}`}
        className="mt-4 grid w-full grid-cols-3 gap-1.5 overflow-hidden rounded-2xl"
      >
        {feedTints.map((tint, i) => (
          <span key={i} className={`flex aspect-square items-center justify-center text-[10px] font-semibold text-muted ${tint}`}>
            [Photo]
          </span>
        ))}
      </a>

      <div className="mt-5 flex gap-5">
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
