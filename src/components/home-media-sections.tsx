"use client";

import Image from "next/image";
import { useCatalog, type HomeMedia } from "@/components/catalog-provider";
import { FacebookIcon, InstagramIcon, StarIcon, TikTokIcon } from "@/components/icons";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

// These sections are filled from /admin → Home page (table home_media).

function useMedia(section: HomeMedia["section"]) {
  return useCatalog().homeMedia.filter((m) => m.section === section);
}

// Sample placeholders, shown until the owner adds real items in /admin → Home page.
const sampleTints = ["bg-pastel-blue", "bg-pastel-peach", "bg-pastel-yellow", "bg-pastel-mint", "bg-pastel-lilac", "bg-pastel-peach"];
const sampleReview = { en: "[One line from the customer's review]", ar: "[جملة من تقييم الزبون]" };

const h2 = "font-display text-2xl font-bold";

/** "Real Moments with Doodlzz": customer photos with a short review. Hidden until there's at least one. */
export function RealMoments({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const moments = useMedia("moment");
  return (
    <section className="mx-auto max-w-6xl pt-11">
      <div className="px-4">
        <h2 className={h2}>{t.moments.title}</h2>
        <p className="mt-1.5 text-sm text-muted">{t.moments.subtitle}</p>
      </div>
      <div className="no-scrollbar mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4">
        {moments.length === 0 &&
          sampleTints.slice(0, 3).map((tint, i) => (
            <figure key={i} className={`relative flex h-[360px] w-[270px] flex-none snap-start items-center justify-center rounded-[22px] ${tint}`}>
              <span className="text-xs font-semibold text-muted">[Customer photo]</span>
              <figcaption className="absolute inset-x-3 bottom-3 flex flex-col gap-1 rounded-2xl bg-white px-3.5 py-3">
                <span className="flex gap-0.5 text-star" role="img" aria-label={t.moments.stars(5)}>
                  {Array.from({ length: 5 }, (_, s) => (
                    <StarIcon key={s} />
                  ))}
                </span>
                <span className="text-sm leading-[1.35] font-bold">{sampleReview[locale]}</span>
                <span className="text-xs text-muted">[Customer name] · [Product]</span>
              </figcaption>
            </figure>
          ))}
        {moments.map((m) => (
          <figure key={m.id} className="relative h-[360px] w-[270px] flex-none snap-start overflow-hidden rounded-[22px] bg-surface">
            <Image src={m.image} alt="" fill unoptimized sizes="270px" className="object-cover" />
            {(m.title || m.subtitle) && (
              <figcaption className="absolute inset-x-3 bottom-3 flex flex-col gap-1 rounded-2xl bg-white/95 px-3.5 py-3">
                <span className="flex gap-0.5 text-star" role="img" aria-label={t.moments.stars(m.rating)}>
                  {Array.from({ length: m.rating }, (_, s) => (
                    <StarIcon key={s} />
                  ))}
                </span>
                {m.title && (
                  <span dir="auto" className="text-sm leading-[1.35] font-bold">
                    {m.title}
                  </span>
                )}
                {m.subtitle && (
                  <span dir="auto" className="text-xs text-muted">
                    {m.subtitle}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

/** "Brands we carry": auto-scrolling logos. Hidden until there's at least one. */
export function BrandsMarquee({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const brands = useMedia("brand");
  // Repeat short lists so the strip is always wider than the screen, then render it twice
  // so the -50% loop is seamless.
  const strip = brands.length ? Array.from({ length: Math.ceil(8 / brands.length) }, () => brands).flat() : [];
  return (
    <section className="mx-auto max-w-6xl pt-11">
      <h2 className="px-4 font-display text-xl font-bold">{t.brands.title}</h2>
      <div dir="ltr" className="mt-3.5 overflow-hidden">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {brands.length === 0 &&
            Array.from({ length: 16 }, (_, i) => (
              <span
                key={i}
                aria-hidden={i >= 8}
                className="ms-3 flex h-16 w-[120px] items-center justify-center rounded-[14px] border border-[#e3e7ee] text-xs font-bold text-muted"
              >
                [Brand logo]
              </span>
            ))}
          {[...strip, ...strip].map((b, i) => {
            const tile = (
              <span className="relative block h-16 w-[120px] overflow-hidden rounded-[14px] border border-[#e3e7ee] bg-white">
                <Image src={b.image} alt={i < strip.length ? b.title : ""} fill unoptimized sizes="120px" className="object-contain p-2" />
              </span>
            );
            return (
              <span key={i} className="ms-3" aria-hidden={i >= strip.length}>
                {b.link ? (
                  <a href={b.link} target="_blank" rel="noopener noreferrer" tabIndex={i >= strip.length ? -1 : undefined}>
                    {tile}
                  </a>
                ) : (
                  tile
                )}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** "Join Doodlzz Family": social links, plus a photo grid when photos were added. */
export function FollowUs({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const photos = useMedia("social").slice(0, 9);
  const links = [
    { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
  ];
  return (
    <section className="mx-4 mt-11 flex flex-col items-center gap-1.5 rounded-3xl bg-navy px-4 py-7 text-center text-white md:mx-auto md:max-w-3xl">
      <h2 className="font-display text-[22px] font-bold">{t.follow.title}</h2>
      <p className="text-sm text-[#c9cfdc]">{t.follow.subtitle}</p>

      <div className="mt-4 grid w-full grid-cols-3 gap-1.5 overflow-hidden rounded-2xl">
          {photos.length === 0 &&
            sampleTints.map((tint, i) => (
              <span key={i} className={`flex aspect-square items-center justify-center text-[10px] font-semibold text-muted ${tint}`}>
                [Photo]
              </span>
            ))}
          {photos.map((p) => (
            <a
              key={p.id}
              href={p.link || site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.title || "Instagram"}
              className="relative aspect-square bg-white/10"
            >
              <Image src={p.image} alt="" fill unoptimized sizes="33vw" className="object-cover" />
            </a>
          ))}
      </div>

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
