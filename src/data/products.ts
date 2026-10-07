import { getCategory } from "@/data/catalog";
import type { Localized } from "@/lib/i18n";

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  category: string;
  /** Subcategory slug inside the category (see catalog.ts); "" = none. */
  subcategory?: string;
  /** Age group slugs from catalog.ts. */
  ages: string[];
  /** "boy" and/or "girl"; empty means suitable for both. */
  genders?: string[];
  /** Units sold (counted when orders are placed); used by "Best selling". */
  soldCount?: number;
  /** ISO date the product was added; used by the date sorts. */
  createdAt?: string;
  priceUsd: number;
  /** Old price shown crossed out when the product is on sale. */
  compareAtUsd?: number | null;
  bestSeller?: boolean;
  isNew?: boolean;
  limitedQuantity?: boolean;
  onOffer?: boolean;
  /** Shown on the product page only when filled. */
  brand?: string;
  /** Colour slugs from the palette in catalog.ts. */
  colors?: string[];
  lastPiece?: boolean;
  /** Ids of products shown under "Goes well with" (picked in the admin panel). */
  related?: string[];
  /** Photo URLs; the first one is the main photo. Empty = placeholder tile. */
  images?: string[];
};

/** A row of the `products` table (see supabase/schema.sql). */
export type ProductRow = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  subcategory?: string | null;
  ages: string[];
  genders?: string[] | null;
  sold_count?: number | null;
  created_at?: string;
  price_usd: number | string;
  compare_at_usd: number | string | null;
  images: string[];
  best_seller: boolean;
  is_new: boolean;
  limited_quantity?: boolean | null;
  on_offer?: boolean | null;
  brand?: string | null;
  colors?: string[] | null;
  last_piece?: boolean | null;
  related?: string[] | null;
  active: boolean;
  sort: number;
};

export function fromRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    // Fall back to English where the Arabic text hasn't been entered yet.
    name: { en: row.name_en, ar: row.name_ar || row.name_en },
    description: { en: row.description_en, ar: row.description_ar || row.description_en },
    category: row.category,
    subcategory: row.subcategory ?? "",
    ages: row.ages ?? [],
    genders: row.genders ?? [],
    soldCount: row.sold_count ?? 0,
    createdAt: row.created_at,
    priceUsd: Number(row.price_usd),
    compareAtUsd: row.compare_at_usd == null ? null : Number(row.compare_at_usd),
    bestSeller: row.best_seller,
    isNew: row.is_new,
    limitedQuantity: row.limited_quantity ?? false,
    onOffer: row.on_offer ?? false,
    brand: row.brand ?? "",
    colors: row.colors ?? [],
    lastPiece: row.last_piece ?? false,
    related: row.related ?? [],
    images: row.images ?? [],
  };
}

/**
 * Shown when the database isn't connected yet (local development, or before
 * Supabase is set up). The admin panel can also import these as a starting point.
 */
export const sampleProducts: Product[] = [
  {
    id: "p1",
    slug: "3-in-1-travel-system-stroller",
    name: { en: "3-in-1 Travel System Stroller", ar: "عربة أطفال 3 في 1" },
    description: {
      en: "Stroller, carrycot and infant car seat in one. One-hand fold, all-terrain wheels and a large shopping basket.",
      ar: "عربة وسرير محمول وكرسي سيارة للرضع في منتج واحد. طيّ بيد واحدة، عجلات لكل الطرق وسلة تسوّق كبيرة.",
    },
    category: "baby-essentials",
    subcategory: "strollers",
    ages: ["0-6m", "6-12m", "1-2y", "2-4y"],
    priceUsd: 289,
    bestSeller: true,
  },
  {
    id: "p2",
    slug: "convertible-car-seat-0-4",
    name: { en: "Convertible Car Seat 0–4 yrs", ar: "كرسي سيارة قابل للتحويل 0–4 سنوات" },
    description: {
      en: "Rear- and forward-facing car seat with a 5-point harness, side-impact protection and ISOFIX.",
      ar: "كرسي سيارة باتجاه الخلف والأمام مع حزام بخمس نقاط وحماية جانبية ونظام ISOFIX.",
    },
    category: "baby-essentials",
    subcategory: "car-seats",
    ages: ["0-6m", "6-12m", "1-2y", "2-4y"],
    priceUsd: 149,
    bestSeller: true,
  },
  {
    id: "p3",
    slug: "electric-baby-swing-chair",
    name: { en: "Electric Baby Swing Chair", ar: "كرسي هزّاز كهربائي" },
    description: {
      en: "Gentle swing with 5 speeds, soothing music and a removable toy bar.",
      ar: "هزّاز لطيف بخمس سرعات، موسيقى مهدّئة وقوس ألعاب قابل للإزالة.",
    },
    category: "baby-essentials",
    subcategory: "swing-chairs",
    ages: ["0-6m", "6-12m"],
    priceUsd: 119,
    bestSeller: true,
  },
  {
    id: "p4",
    slug: "musical-play-gym-mat",
    name: { en: "Musical Play Gym Mat", ar: "سجادة لعب موسيقية" },
    description: {
      en: "Soft padded mat with hanging toys, a piano kick pad and lights for tummy time.",
      ar: "سجادة مبطّنة مع ألعاب معلّقة وبيانو للقدمين وأضواء لوقت اللعب على البطن.",
    },
    category: "baby-essentials",
    subcategory: "play-mats",
    ages: ["0-6m", "6-12m"],
    priceUsd: 45,
    bestSeller: true,
  },
  {
    id: "p5",
    slug: "foldable-baby-walker",
    name: { en: "Foldable Baby Walker", ar: "مشّاية أطفال قابلة للطي" },
    description: {
      en: "Height-adjustable walker with an activity tray and anti-slip stoppers. Folds flat for storage.",
      ar: "مشّاية قابلة لتعديل الارتفاع مع صينية ألعاب ومانع انزلاق. تُطوى بسهولة للتخزين.",
    },
    category: "baby-essentials",
    subcategory: "walkers",
    ages: ["6-12m", "1-2y"],
    priceUsd: 55,
    isNew: true,
  },
  {
    id: "p6",
    slug: "adjustable-high-chair",
    name: { en: "Adjustable High Chair", ar: "كرسي طعام قابل للتعديل" },
    description: {
      en: "7 height positions, reclining seat and a dishwasher-safe tray.",
      ar: "7 مستويات للارتفاع، مقعد قابل للإمالة وصينية آمنة لغسالة الصحون.",
    },
    category: "baby-essentials",
    subcategory: "high-chairs",
    ages: ["6-12m", "1-2y", "2-4y"],
    priceUsd: 89,
    isNew: true,
  },
  {
    id: "p7",
    slug: "wooden-crib-with-drawer",
    name: { en: "Wooden Crib with Drawer", ar: "سرير خشبي مع درج" },
    description: {
      en: "Solid wood crib with 3 mattress heights and a large storage drawer. Converts to a toddler bed.",
      ar: "سرير من الخشب الصلب بثلاثة ارتفاعات للفرشة ودرج تخزين كبير. يتحوّل إلى سرير للأطفال.",
    },
    category: "baby-essentials",
    subcategory: "beds",
    ages: ["0-6m", "6-12m", "1-2y", "2-4y"],
    priceUsd: 259,
    isNew: true,
  },
  {
    id: "p8",
    slug: "foldable-baby-bath-tub",
    name: { en: "Foldable Baby Bath Tub", ar: "حوض استحمام قابل للطي" },
    description: {
      en: "Space-saving bath tub with a temperature indicator and a non-slip base.",
      ar: "حوض استحمام موفّر للمساحة مع مؤشر لحرارة الماء وقاعدة مانعة للانزلاق.",
    },
    category: "baby-essentials",
    subcategory: "bath-potty",
    ages: ["0-6m", "6-12m", "1-2y"],
    priceUsd: 35,
    isNew: true,
  },
  {
    id: "p9",
    slug: "lightweight-cabin-stroller",
    name: { en: "Lightweight Cabin Stroller", ar: "عربة خفيفة للسفر" },
    description: {
      en: "Under 7 kg and small enough for airplane cabins. Full recline and a big sun canopy.",
      ar: "أقل من 7 كغ وصغيرة بما يكفي لمقصورة الطائرة. إمالة كاملة ومظلة شمس كبيرة.",
    },
    category: "baby-essentials",
    subcategory: "strollers",
    ages: ["6-12m", "1-2y", "2-4y"],
    priceUsd: 159,
  },
  {
    id: "p10",
    slug: "booster-car-seat",
    name: { en: "High-Back Booster Seat", ar: "كرسي سيارة معزّز بظهر" },
    description: {
      en: "Grows with your child with an adjustable headrest and side wings.",
      ar: "يكبر مع طفلك بمسند رأس قابل للتعديل وأجنحة جانبية.",
    },
    category: "baby-essentials",
    subcategory: "car-seats",
    ages: ["2-4y", "4-6y"],
    priceUsd: 79,
  },
  {
    id: "p11",
    slug: "training-potty-with-lid",
    name: { en: "Training Potty with Lid", ar: "نونية تدريب مع غطاء" },
    description: {
      en: "Comfortable potty with a splash guard, removable bowl and a lid.",
      ar: "نونية مريحة مع واقي رذاذ ووعاء قابل للإزالة وغطاء.",
    },
    category: "baby-essentials",
    subcategory: "bath-potty",
    ages: ["1-2y", "2-4y", "4-6y"],
    priceUsd: 19,
  },
  {
    id: "p12",
    slug: "kids-wooden-bedroom-set",
    name: { en: "Kids Wooden Bedroom Set", ar: "غرفة نوم خشبية للأطفال" },
    description: {
      en: "Bed, wardrobe and dresser in natural wood. Delivery and assembly included.",
      ar: "سرير وخزانة وتسريحة من الخشب الطبيعي. يشمل التوصيل والتركيب.",
    },
    category: "baby-essentials",
    subcategory: "beds",
    ages: ["2-4y", "4-6y"],
    priceUsd: 890,
  },
];

export function searchProducts(list: Product[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => {
    const category = getCategory(p.category);
    const haystack = [p.name.en, p.name.ar, category?.name.en, category?.name.ar]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
