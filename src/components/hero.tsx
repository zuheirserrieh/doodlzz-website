"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { CategoryIcon, ChevronIcon } from "@/components/icons";
import { SearchForm } from "@/components/search-form";
import { useDict, useStore } from "@/components/store-provider";
import type { CategoryIcon as CategoryIconName } from "@/data/catalog";

// Sample slides, shown until the owner adds slides in /admin → Home page → Slideshow.
const sampleArt: { tint: string; art: string; icon: CategoryIconName; href: string }[] = [
  { tint: "bg-pastel-peach", art: "text-[#e9b9a6]", icon: "stroller", href: "/category/baby-essentials?sub=strollers" },
  { tint: "bg-pastel-blue", art: "text-[#b3d0e8]", icon: "carSeat", href: "/category/baby-essentials?sub=car-seats" },
  { tint: "bg-pastel-mint", art: "text-[#b2dbc4]", icon: "bed", href: "/category/baby-essentials?sub=beds" },
];

const INTERVAL_MS = 6000;

type Slide = { key: string; title: string; text: string; href: string; image?: string; tint?: string; art?: string; icon?: CategoryIconName };

/** Hero slideshow with the search bar on top. Slides come from the dashboard (photos), else samples. */
export function Hero() {
  const { locale } = useStore();
  const t = useDict();
  const { homeMedia } = useCatalog();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // "Shop now" links typed in the dashboard: "/category/sport" → "/en/category/sport"; full URLs stay as they are.
  const localHref = (link: string) => (!link ? `/${locale}/shop` : link.startsWith("/") ? `/${locale}${link}` : link);

  const owned = homeMedia.filter((m) => m.section === "hero");
  const slides: Slide[] = owned.length
    ? owned.map((m) => ({
        key: m.id,
        image: m.image,
        title: (locale === "ar" && m.title_ar) || m.title,
        text: (locale === "ar" && m.subtitle_ar) || m.subtitle,
        href: localHref(m.link),
      }))
    : sampleArt.map((a, i) => ({ key: String(i), ...a, href: `/${locale}${a.href}`, title: t.hero.slides[i].title, text: t.hero.slides[i].text }));
  const count = slides.length;
  const current = slides[index % count];

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  const photo = Boolean(current.image);

  return (
    <section className="mx-auto max-w-6xl md:px-4 md:pt-4" aria-roledescription="carousel">
      <div
        className={`relative flex h-[460px] flex-col overflow-hidden rounded-b-[28px] px-4 pt-4 pb-6 transition-colors duration-500 md:rounded-3xl md:p-6 ${
          current.tint ?? "bg-navy"
        }`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {photo ? (
          <>
            {slides.map((s, i) => (
              <Image
                key={s.key}
                src={s.image!}
                alt=""
                fill
                unoptimized
                priority={i === 0}
                sizes="(min-width: 1152px) 1152px, 100vw"
                className={`object-cover transition-opacity duration-700 ${i === index % count ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            {/* Soft shade so the title and buttons stay readable on any photo. */}
            {(current.title || current.text) && (
              <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-navy/10 to-transparent" aria-hidden />
            )}
          </>
        ) : (
          current.icon && (
            <CategoryIcon
              name={current.icon}
              size={220}
              strokeWidth={1.2}
              className={`absolute -end-5 bottom-14 rtl:-scale-x-100 md:end-10 md:size-[300px] ${current.art}`}
            />
          )
        )}

        <SearchForm className="relative z-10 md:max-w-xl" />

        {(current.title || current.text) && (
          <div
            key={current.key}
            className={`relative flex max-w-[260px] flex-col gap-3 md:max-w-md ${photo ? "mt-auto mb-5 text-white" : "mt-10"}`}
          >
            {current.title && (
              <h1 className={`font-display text-[34px] leading-[1.08] font-bold md:text-5xl ${photo ? "drop-shadow-md" : ""}`}>{current.title}</h1>
            )}
            {current.text && (
              <p className={`text-[15px] leading-normal ${photo ? "font-semibold drop-shadow" : "text-ink-soft"}`}>{current.text}</p>
            )}
          </div>
        )}

        <div className={`relative flex items-center justify-between ${photo && (current.title || current.text) ? "" : "mt-auto"}`}>
          <Link
            href={current.href}
            className="flex h-12 items-center gap-2 rounded-full bg-accent/75 px-[22px] text-[15px] font-extrabold text-white shadow-sm ring-1 ring-white/50 backdrop-blur-md hover:bg-accent/90 hover:text-white"
          >
            {t.hero.cta}
            <ChevronIcon strokeWidth={2.4} className="rtl:rotate-180" />
          </Link>
          {count > 1 && (
            <div className="flex gap-1.5" role="group" aria-label={t.hero.slideOf((index % count) + 1, count)}>
              {slides.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  aria-label={t.hero.goTo(i + 1)}
                  aria-current={i === index % count ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className="flex h-6 cursor-pointer items-center"
                >
                  <span
                    className={`block h-2 rounded-full shadow-sm transition-all ${
                      i === index % count ? (photo ? "w-5 bg-white" : "w-5 bg-navy") : photo ? "w-2 bg-white/60" : "w-2 bg-navy/25"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
