"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryIcon, ChevronIcon } from "@/components/icons";
import { SearchForm } from "@/components/search-form";
import { useDict, useStore } from "@/components/store-provider";
import type { CategoryIcon as CategoryIconName } from "@/data/catalog";

// TODO(owner): replace with real slide photos or a video.
const slideArt: { tint: string; dot: string; art: string; icon: CategoryIconName; href: string }[] = [
  { tint: "bg-pastel-peach", dot: "bg-[#e3b3a1]", art: "text-[#e9b9a6]", icon: "stroller", href: "/category/strollers" },
  { tint: "bg-pastel-blue", dot: "bg-[#a9c8e2]", art: "text-[#b3d0e8]", icon: "carSeat", href: "/category/car-seats" },
  { tint: "bg-pastel-mint", dot: "bg-[#a8d5bc]", art: "text-[#b2dbc4]", icon: "bed", href: "/category/beds" },
];

const INTERVAL_MS = 6000;

/** Hero slideshow with the search bar sitting on top of the slide. */
export function Hero() {
  const { locale } = useStore();
  const t = useDict();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slideArt.length;

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  const art = slideArt[index];
  const copy = t.hero.slides[index];

  return (
    <section className="mx-auto max-w-6xl md:px-4 md:pt-4" aria-roledescription="carousel">
      <div
        className={`relative flex h-[460px] flex-col overflow-hidden rounded-b-[28px] px-4 pt-4 pb-6 transition-colors duration-500 md:rounded-3xl md:p-6 ${art.tint}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <CategoryIcon
          name={art.icon}
          size={220}
          strokeWidth={1.2}
          className={`absolute -end-5 bottom-14 rtl:-scale-x-100 md:end-10 md:size-[300px] ${art.art}`}
        />

        <SearchForm className="relative z-10 md:max-w-xl" />

        <div key={index} className="relative mt-10 flex max-w-[250px] flex-col gap-3 md:max-w-md">
          <h1 className="font-display text-[34px] leading-[1.08] font-semibold md:text-5xl">{copy.title}</h1>
          <p className="text-[15px] leading-normal text-ink-soft">{copy.text}</p>
        </div>

        <div className="relative mt-auto flex items-center justify-between">
          <Link
            href={`/${locale}${art.href}`}
            className="flex h-12 items-center gap-2 rounded-full bg-accent px-[22px] text-[15px] font-extrabold text-white hover:bg-accent-dark hover:text-white"
          >
            {t.hero.cta}
            <ChevronIcon strokeWidth={2.4} className="rtl:rotate-180" />
          </Link>
          <div className="flex gap-1.5" role="group" aria-label={t.hero.slideOf(index + 1, count)}>
            {slideArt.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-label={t.hero.goTo(i + 1)}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className="flex h-6 cursor-pointer items-center"
              >
                <span className={`block h-2 rounded-full transition-all ${i === index ? "w-5 bg-navy" : `w-2 ${art.dot}`}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
