import type { Localized } from "@/lib/i18n";

export type CategoryIcon =
  | "stroller"
  | "carSeat"
  | "swing"
  | "playMat"
  | "walker"
  | "highChair"
  | "bed"
  | "bathTub"
  | "potty";

export type Category = {
  slug: string;
  /** Full name, used in the menu and on category pages. */
  name: Localized;
  /** Shorter name that fits the home page tiles. */
  shortName: Localized;
  icon: CategoryIcon;
  /** Pastel tile background (Tailwind class). */
  tint: string;
};

export const categories: Category[] = [
  {
    slug: "strollers",
    name: { en: "Strollers", ar: "عربات الأطفال" },
    shortName: { en: "Strollers", ar: "عربات" },
    icon: "stroller",
    tint: "bg-pastel-blue",
  },
  {
    slug: "car-seats",
    name: { en: "Car Seats", ar: "كراسي السيارة" },
    shortName: { en: "Car Seats", ar: "كراسي سيارة" },
    icon: "carSeat",
    tint: "bg-pastel-peach",
  },
  {
    slug: "swing-chairs",
    name: { en: "Baby Swing Chairs", ar: "كراسي هزّازة" },
    shortName: { en: "Swing Chairs", ar: "كراسي هزّازة" },
    icon: "swing",
    tint: "bg-pastel-yellow",
  },
  {
    slug: "play-mats",
    name: { en: "Baby Play Mat", ar: "سجادات اللعب" },
    shortName: { en: "Play Mats", ar: "سجادات لعب" },
    icon: "playMat",
    tint: "bg-pastel-mint",
  },
  {
    slug: "walkers",
    name: { en: "Baby Walker & Youpala", ar: "مشّايات الأطفال" },
    shortName: { en: "Walkers & Youpala", ar: "مشّايات" },
    icon: "walker",
    tint: "bg-pastel-lilac",
  },
  {
    slug: "high-chairs",
    name: { en: "Baby High Chair", ar: "كراسي الطعام" },
    shortName: { en: "High Chairs", ar: "كراسي طعام" },
    icon: "highChair",
    tint: "bg-pastel-blue",
  },
  {
    slug: "beds",
    name: { en: "Baby Bed & Wood Bedrooms", ar: "أسرّة وغرف نوم خشبية" },
    shortName: { en: "Beds & Bedrooms", ar: "أسرّة وغرف" },
    icon: "bed",
    tint: "bg-pastel-peach",
  },
  {
    slug: "bath-tubs",
    name: { en: "Baby Bath Tub", ar: "أحواض الاستحمام" },
    shortName: { en: "Bath Tubs", ar: "أحواض استحمام" },
    icon: "bathTub",
    tint: "bg-pastel-yellow",
  },
  {
    slug: "potty",
    name: { en: "Kids Potty", ar: "نونية الأطفال" },
    shortName: { en: "Kids Potty", ar: "نونية" },
    icon: "potty",
    tint: "bg-pastel-mint",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

// TODO(owner): confirm age groups against the owner's shop-by-age image.
export type AgeGroup = {
  slug: string;
  label: string;
  unit: "months" | "years";
  tint: string;
};

export const ageGroups: AgeGroup[] = [
  { slug: "0-6m", label: "0–6", unit: "months", tint: "bg-pastel-blue" },
  { slug: "6-12m", label: "6–12", unit: "months", tint: "bg-pastel-peach" },
  { slug: "1-2y", label: "1–2", unit: "years", tint: "bg-pastel-yellow" },
  { slug: "2-4y", label: "2–4", unit: "years", tint: "bg-pastel-mint" },
  { slug: "4y-plus", label: "4+", unit: "years", tint: "bg-pastel-lilac" },
];

export function getAgeGroup(slug: string) {
  return ageGroups.find((a) => a.slug === slug);
}
