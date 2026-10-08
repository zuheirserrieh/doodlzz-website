import type { Localized } from "@/lib/i18n";

export type CategoryIcon =
  // category icons
  | "baby"
  | "girls"
  | "boys"
  | "rideOn"
  | "school"
  | "sport"
  | "outdoor"
  | "home"
  | "camping"
  | "winter"
  | "adult"
  // used by the hero slides
  | "stroller"
  | "carSeat"
  | "swing"
  | "playMat"
  | "walker"
  | "highChair"
  | "bed"
  | "bathTub"
  | "potty";

export type Subcategory = { slug: string; name: Localized };

export type Category = {
  slug: string;
  /** Full name, used in the menu and on category pages. */
  name: Localized;
  /** Shorter name that fits the home page tiles. */
  shortName: Localized;
  icon: CategoryIcon;
  /** Pastel tile background (Tailwind class). */
  tint: string;
  /** Shown as round pictures at the top of the category page ("View all" first). */
  subs: Subcategory[];
};

const sub = (slug: string, en: string, ar: string): Subcategory => ({ slug, name: { en, ar } });

// TODO(owner): category list from the owner (6 Oct 2026). Product photos per (sub)category: /admin → Categories.
export const categories: Category[] = [
  {
    slug: "baby-essentials",
    name: { en: "Baby Essentials", ar: "مستلزمات الرضّع" },
    shortName: { en: "Baby Essentials", ar: "مستلزمات الرضّع" },
    icon: "baby",
    tint: "bg-pastel-blue",
    subs: [
      sub("strollers", "Strollers", "عربات الأطفال"),
      sub("car-seats", "Car Seats", "كراسي السيارة"),
      sub("high-chairs", "High Chair & Feeding", "كراسي الطعام والتغذية"),
      sub("swing-chairs", "Swing Chairs", "كراسي هزّازة"),
      sub("walkers", "Walker & Youpala", "مشّايات"),
      sub("bath-potty", "Bath Tub & Potty", "أحواض الاستحمام والنونية"),
      sub("play-mats", "Play Mat & Puzzle Mats", "سجادات اللعب والبازل"),
      sub("beds", "Beds & Wood Bedrooms", "أسرّة وغرف نوم خشبية"),
      sub("playpens", "Toys & Playpens", "ألعاب وأسرّة لعب"),
      sub("monitors", "Monitors & Cameras", "أجهزة مراقبة وكاميرات"),
      sub("bags-carriers", "Baby Bags & Carriers", "حقائب وحمّالات الأطفال"),
      sub("safety", "Safety & Protection", "السلامة والحماية"),
      sub("care-teethers", "Baby Care & Teethers", "العناية بالطفل والعضّاضات"),
    ],
  },
  {
    slug: "girls-toys",
    name: { en: "Girls Toys", ar: "ألعاب البنات" },
    shortName: { en: "Girls Toys", ar: "ألعاب البنات" },
    icon: "girls",
    tint: "bg-pastel-peach",
    subs: [
      sub("kitchens", "Kitchens", "مطابخ"),
      sub("makeup-hair-nails", "Makeup, Hair & Nails", "مكياج وشعر وأظافر"),
      sub("dolls", "Barbie & Dolls", "باربي ودمى"),
      sub("wool-bead", "Wool & Bead", "صوف وخرز"),
      sub("home-toys", "Home Toys", "ألعاب المنزل"),
      sub("doctor-toys", "Doctor Toys", "ألعاب الطبيب"),
      sub("girls-art", "Art", "فنون"),
      sub("girls-music", "Music", "موسيقى"),
    ],
  },
  {
    slug: "boys-toys",
    name: { en: "Boys Toys", ar: "ألعاب الأولاد" },
    shortName: { en: "Boys Toys", ar: "ألعاب الأولاد" },
    icon: "boys",
    tint: "bg-pastel-yellow",
    subs: [
      sub("cars", "Cars", "سيارات"),
      sub("boys-sport-games", "Sport Games", "ألعاب رياضية"),
      sub("toy-guns", "Toy Guns", "مسدسات ألعاب"),
      sub("boys-kitchen", "Kitchen", "مطبخ"),
      sub("boys-art", "Art", "فنون"),
      sub("boys-music", "Music", "موسيقى"),
    ],
  },
  {
    slug: "ride-on",
    name: { en: "Ride-On & Wheeled Toys", ar: "ألعاب الركوب والعجلات" },
    shortName: { en: "Ride-On & Wheels", ar: "ركوب وعجلات" },
    icon: "rideOn",
    tint: "bg-pastel-mint",
    subs: [
      sub("bicycles", "Bicycles", "دراجات"),
      sub("tricycles", "Tricycles", "دراجات بثلاث عجلات"),
      sub("scooters", "Scooters", "سكوترات"),
      sub("cocar-plasma", "Cocar & Plasma Car", "كوكار وبلازما كار"),
      sub("rocking-toys", "Rocking Toys", "ألعاب هزّازة"),
      sub("drifting-scooters", "Drifting Scooters", "سكوترات دريفت"),
      sub("battery-cars", "Battery Cars", "سيارات على البطارية"),
      sub("battery-motors", "Battery Motors", "دراجات نارية على البطارية"),
      sub("roller-skates", "Roller Skates", "أحذية تزلج"),
      sub("skateboards", "Skateboards", "ألواح تزلج"),
    ],
  },
  {
    slug: "school-educational",
    name: { en: "School & Educational Toys", ar: "ألعاب مدرسية وتعليمية" },
    shortName: { en: "School & Learning", ar: "مدرسة وتعليم" },
    icon: "school",
    tint: "bg-pastel-lilac",
    subs: [
      sub("wood-toys", "Wood Toys", "ألعاب خشبية"),
      sub("blocks-lego", "Blocks & Lego", "مكعبات وليغو"),
      sub("boards-drawing", "Boards & Drawing Stands", "ألواح وحوامل رسم"),
      sub("puzzles-books", "Puzzles & Books", "بازل وكتب"),
      sub("learning-toys", "Learning Toys", "ألعاب تعليمية"),
      sub("school-bags", "School Bags & Lunch Boxes", "حقائب مدرسية وعلب طعام"),
      sub("kids-tables-chairs", "Tables & Chairs", "طاولات وكراسي"),
      sub("more-school", "More School & Education", "المزيد للمدرسة والتعليم"),
    ],
  },
  {
    slug: "sport",
    name: { en: "Sport Equipment & Sport Games", ar: "معدات وألعاب رياضية" },
    shortName: { en: "Sport", ar: "رياضة" },
    icon: "sport",
    tint: "bg-pastel-blue",
    subs: [
      sub("sport-tables", "Sport Tables", "طاولات رياضية"),
      sub("sport-games", "Sport Games", "ألعاب رياضية"),
      sub("gym-machines", "Gym Sport Machines", "أجهزة رياضية"),
      sub("sport-equipment", "Sport Equipment", "معدات رياضية"),
      sub("sport-bags", "Sport Bags", "حقائب رياضية"),
    ],
  },
  {
    slug: "outdoor",
    name: { en: "Outdoor Toys", ar: "ألعاب خارجية" },
    shortName: { en: "Outdoor Toys", ar: "ألعاب خارجية" },
    icon: "outdoor",
    tint: "bg-pastel-peach",
    subs: [
      sub("swings-slides", "Swings & Slides", "أراجيح وزحليقات"),
      sub("inflatables", "Inflatables", "ألعاب نفخ"),
      sub("trampolines", "Trampolines", "ترامبولين"),
      sub("playgrounds", "Big Playgrounds", "ملاعب كبيرة"),
      sub("imitation-figures", "Imitation Figures", "مجسّمات"),
    ],
  },
  {
    slug: "home-garden",
    name: { en: "Home & Garden", ar: "المنزل والحديقة" },
    shortName: { en: "Home & Garden", ar: "المنزل والحديقة" },
    icon: "home",
    tint: "bg-pastel-yellow",
    subs: [
      sub("tents-umbrellas", "Tents & Umbrellas", "خيم ومظلات"),
      sub("adult-swings", "Adult Swings", "أراجيح للكبار"),
      sub("garden-tables-chairs", "Tables & Chairs", "طاولات وكراسي"),
      sub("safes", "Safes", "خزنات"),
      sub("artificial-grass", "Artificial Grass", "عشب صناعي"),
    ],
  },
  {
    slug: "camping",
    name: { en: "Camping", ar: "التخييم" },
    shortName: { en: "Camping", ar: "التخييم" },
    icon: "camping",
    tint: "bg-pastel-mint",
    subs: [],
  },
  {
    slug: "adult-games",
    name: { en: "Adult Games", ar: "ألعاب الكبار" },
    shortName: { en: "Adult Games", ar: "ألعاب الكبار" },
    icon: "adult",
    tint: "bg-pastel-lilac",
    subs: [],
  },
  {
    slug: "winter",
    name: { en: "Winter", ar: "الشتاء" },
    shortName: { en: "Winter", ar: "الشتاء" },
    icon: "winter",
    tint: "bg-pastel-blue",
    subs: [],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getSubcategory(category: string, slug: string | undefined) {
  if (!slug) return undefined;
  return getCategory(category)?.subs.find((s) => s.slug === slug);
}

export type AgeGroup = {
  slug: string;
  /** Big text on the age tile, e.g. "0–6". */
  label: string;
  /** Small text under it, e.g. "Months". */
  sub: Localized;
  tint: string;
};

const months = { en: "Months", ar: "أشهر" };
const years = { en: "Years", ar: "سنوات" };

// Age groups from the owner (6 Oct 2026).
export const ageGroups: AgeGroup[] = [
  { slug: "0-6m", label: "0–6", sub: months, tint: "bg-pastel-blue" },
  { slug: "6-12m", label: "6–12", sub: months, tint: "bg-pastel-peach" },
  { slug: "1-2y", label: "1–2", sub: years, tint: "bg-pastel-yellow" },
  { slug: "2-4y", label: "2–4", sub: years, tint: "bg-pastel-mint" },
  { slug: "4-6y", label: "4–6", sub: years, tint: "bg-pastel-lilac" },
  { slug: "6-8y", label: "6–8", sub: years, tint: "bg-pastel-blue" },
  { slug: "8-11y", label: "8–11", sub: years, tint: "bg-pastel-peach" },
  { slug: "teens", label: "11–14+", sub: { en: "Teens", ar: "مراهقون" }, tint: "bg-pastel-yellow" },
  { slug: "adults", label: "18+", sub: { en: "Adults", ar: "كبار" }, tint: "bg-pastel-mint" },
];

export function getAgeGroup(slug: string) {
  return ageGroups.find((a) => a.slug === slug);
}

/** "0–6 Months", "11–14+ Teens"… */
export function ageName(a: AgeGroup, locale: "en" | "ar") {
  return `${a.label} ${a.sub[locale]}`;
}

export type ColorOption = { slug: string; name: { en: string; ar: string }; hex: string };

/** Basic colours the owner can tick per product (shown as swatches with names). */
export const colorPalette: ColorOption[] = [
  { slug: "red", name: { en: "Red", ar: "أحمر" }, hex: "#E53935" },
  { slug: "pink", name: { en: "Pink", ar: "زهري" }, hex: "#F48FB1" },
  { slug: "purple", name: { en: "Purple", ar: "بنفسجي" }, hex: "#8E44AD" },
  { slug: "blue", name: { en: "Blue", ar: "أزرق" }, hex: "#1E63D6" },
  { slug: "light-blue", name: { en: "Light blue", ar: "أزرق فاتح" }, hex: "#8CCBF2" },
  { slug: "green", name: { en: "Green", ar: "أخضر" }, hex: "#2E9E58" },
  { slug: "yellow", name: { en: "Yellow", ar: "أصفر" }, hex: "#FFD233" },
  { slug: "orange", name: { en: "Orange", ar: "برتقالي" }, hex: "#FF8A1F" },
  { slug: "brown", name: { en: "Brown", ar: "بني" }, hex: "#8B5A2B" },
  { slug: "beige", name: { en: "Beige", ar: "بيج" }, hex: "#E8D7B8" },
  { slug: "grey", name: { en: "Grey", ar: "رمادي" }, hex: "#9AA0A6" },
  { slug: "black", name: { en: "Black", ar: "أسود" }, hex: "#1F1F1F" },
  { slug: "white", name: { en: "White", ar: "أبيض" }, hex: "#FFFFFF" },
  { slug: "multicolor", name: { en: "Multicolor", ar: "متعدد الألوان" }, hex: "conic-gradient(#E53935,#FFD233,#2E9E58,#1E63D6,#8E44AD,#E53935)" },
];

/**
 * Colours the owner adds in the admin are saved inside the product as
 * "#hex|English name|Arabic name" (Arabic optional).
 */
export function customColorSlug(hex: string, en: string, ar: string) {
  const clean = (s: string) => s.replace(/\|/g, " ").trim();
  return [hex, clean(en), clean(ar)].filter(Boolean).join("|");
}

export function getColor(slug: string): ColorOption | undefined {
  if (slug.startsWith("#")) {
    const [hex, en = "", ar = ""] = slug.split("|");
    return { slug, hex, name: { en: en || hex, ar: ar || en || hex } };
  }
  return colorPalette.find((c) => c.slug === slug);
}
