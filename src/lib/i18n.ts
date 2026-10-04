export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dirOf(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

/** A piece of text that exists in every supported language. */
export type Localized = Record<Locale, string>;

const en = {
  announcement: "Fast delivery all over Lebanon",
  nav: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    settings: "Settings",
    signIn: "Sign in",
    cart: (n: number) => `Shopping cart, ${n} ${n === 1 ? "item" : "items"}`,
    home: "Doodlzz home",
  },
  search: {
    label: "Search products",
    placeholder: "Search strollers, car seats…",
  },
  age: {
    title: "Shop by age",
    months: "Months",
    years: "Years",
  },
  hero: {
    slides: [
      {
        title: "Little steps, big moments.",
        text: "Strollers, car seats and nursery essentials for every stage.",
      },
      {
        title: "Safe rides, happy faces.",
        text: "Car seats tested for every age, from newborn to 4 years.",
      },
      {
        title: "Sweet dreams start here.",
        text: "Wooden cribs and full bedrooms made to grow with your baby.",
      },
    ],
    cta: "Shop now",
    slideOf: (i: number, n: number) => `Slide ${i} of ${n}`,
    goTo: (i: number) => `Go to slide ${i}`,
  },
  catalog: {
    title: "Catalog",
    viewAll: "View all",
  },
  picked: {
    title: "Picked by parents",
    best: "Best sellers",
    fresh: "New arrivals",
    seeAll: "See all products",
  },
  product: {
    addToCart: "Add to cart",
    added: "Added ✓",
    addToWishlist: "Add to wishlist",
    badgeBest: "Best seller",
    badgeNew: "New",
    photo: "Product photo",
    ages: "Suitable for",
    orderWhatsApp: "Order on WhatsApp",
    whatsAppMessage: (name: string) => `Hi Doodlzz! I'd like to order: ${name}`,
    related: "You may also like",
    delivery: "Fast delivery all over Lebanon",
    exchange: "Easy exchange policy",
    backTo: "Back to",
  },
  listing: {
    allProducts: "All products",
    results: (n: number) => `${n} ${n === 1 ? "product" : "products"}`,
    searchFor: (q: string) => `Results for “${q}”`,
    empty: "No products found. Try another search or browse the catalog.",
    ageTitle: (label: string) => `Shop by age: ${label}`,
  },
  moments: {
    title: "Real Moments with Doodlzz",
    subtitle: "Photos shared by our families",
    stars: (n: number) => `${n} out of 5 stars`,
  },
  brands: {
    title: "Brands we carry",
  },
  follow: {
    title: "Follow the fun",
    subtitle: "Tips, new arrivals and real moments every week",
  },
  footer: {
    aboutTitle: "About us",
    about:
      "Doodlzz is a Lebanese baby & kids store. We hand-pick safe, comfortable essentials for every stage and deliver them to your door, all over Lebanon.",
    readStory: "Read our story",
    shop: "Shop",
    help: "Help",
    contact: "Contact us",
    deliveryLink: "Delivery",
    exchangeLink: "Exchange policy",
    account: "My account",
    shopByAge: "Shop by age",
    rights: (y: number) => `© ${y} Doodlzz. All rights reserved.`,
  },
  menu: {
    title: "Menu",
    pitch: "Track orders and save your wishlist",
    signIn: "Sign in",
    createAccount: "Create account",
    catalog: "Catalog",
    settings: "Settings",
    language: "Language",
    currency: "Currency",
    whatsapp: "Order or ask on WhatsApp",
  },
  whatsapp: {
    chat: "Chat",
    chatLabel: "Chat with us on WhatsApp",
    greeting: "Hi Doodlzz! I have a question.",
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is empty.",
    keepShopping: "Keep shopping",
    remove: "Remove",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    quantity: "Quantity",
    subtotal: "Subtotal",
    deliveryNote: "Delivery fee is confirmed on WhatsApp.",
    checkout: "Send order on WhatsApp",
    orderIntro: "Hi Doodlzz! I'd like to order:",
    orderTotal: "Total",
  },
  notFound: {
    title: "Page not found",
    text: "We couldn't find that page.",
    home: "Back to home",
  },
};

export type Dictionary = typeof en;

const ar: Dictionary = {
  announcement: "توصيل سريع إلى كل لبنان",
  nav: {
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    settings: "الإعدادات",
    signIn: "تسجيل الدخول",
    cart: (n) => `سلة التسوق، ${n} ${n === 1 ? "منتج" : "منتجات"}`,
    home: "الصفحة الرئيسية لـ Doodlzz",
  },
  search: {
    label: "ابحث عن المنتجات",
    placeholder: "ابحث عن عربات، كراسي سيارة…",
  },
  age: {
    title: "تسوّق حسب العمر",
    months: "أشهر",
    years: "سنوات",
  },
  hero: {
    slides: [
      {
        title: "خطوات صغيرة، لحظات كبيرة.",
        text: "عربات أطفال وكراسي سيارة ومستلزمات غرفة الطفل لكل مرحلة.",
      },
      {
        title: "رحلات آمنة، وجوه سعيدة.",
        text: "كراسي سيارة لكل عمر، من الولادة حتى 4 سنوات.",
      },
      {
        title: "الأحلام الحلوة تبدأ هنا.",
        text: "أسرّة خشبية وغرف نوم كاملة تكبر مع طفلك.",
      },
    ],
    cta: "تسوّق الآن",
    slideOf: (i, n) => `الشريحة ${i} من ${n}`,
    goTo: (i) => `الانتقال إلى الشريحة ${i}`,
  },
  catalog: {
    title: "الأقسام",
    viewAll: "عرض الكل",
  },
  picked: {
    title: "اختيارات الأهل",
    best: "الأكثر مبيعاً",
    fresh: "وصل حديثاً",
    seeAll: "عرض كل المنتجات",
  },
  product: {
    addToCart: "أضف إلى السلة",
    added: "تمت الإضافة ✓",
    addToWishlist: "أضف إلى المفضلة",
    badgeBest: "الأكثر مبيعاً",
    badgeNew: "جديد",
    photo: "صورة المنتج",
    ages: "مناسب لعمر",
    orderWhatsApp: "اطلب عبر واتساب",
    whatsAppMessage: (name) => `مرحباً Doodlzz! أريد أن أطلب: ${name}`,
    related: "قد يعجبك أيضاً",
    delivery: "توصيل سريع إلى كل لبنان",
    exchange: "سياسة استبدال سهلة",
    backTo: "العودة إلى",
  },
  listing: {
    allProducts: "كل المنتجات",
    results: (n) => `${n} ${n === 1 ? "منتج" : "منتجات"}`,
    searchFor: (q) => `نتائج البحث عن «${q}»`,
    empty: "لم نجد أي منتج. جرّب بحثاً آخر أو تصفّح الأقسام.",
    ageTitle: (label) => `تسوّق حسب العمر: ${label}`,
  },
  moments: {
    title: "لحظات حقيقية مع Doodlzz",
    subtitle: "صور شاركتها عائلاتنا",
    stars: (n) => `${n} من 5 نجوم`,
  },
  brands: {
    title: "الماركات المتوفرة",
  },
  follow: {
    title: "تابعونا",
    subtitle: "نصائح، منتجات جديدة ولحظات حقيقية كل أسبوع",
  },
  footer: {
    aboutTitle: "من نحن",
    about:
      "Doodlzz متجر لبناني لمستلزمات الأطفال. نختار بعناية منتجات آمنة ومريحة لكل مرحلة ونوصلها إلى باب منزلك في كل لبنان.",
    readStory: "اقرأ قصتنا",
    shop: "تسوّق",
    help: "مساعدة",
    contact: "اتصل بنا",
    deliveryLink: "التوصيل",
    exchangeLink: "سياسة الاستبدال",
    account: "حسابي",
    shopByAge: "تسوّق حسب العمر",
    rights: (y) => `© ${y} Doodlzz. جميع الحقوق محفوظة.`,
  },
  menu: {
    title: "القائمة",
    pitch: "تابع طلباتك واحفظ قائمة المفضلة",
    signIn: "تسجيل الدخول",
    createAccount: "إنشاء حساب",
    catalog: "الأقسام",
    settings: "الإعدادات",
    language: "اللغة",
    currency: "العملة",
    whatsapp: "اطلب أو اسأل عبر واتساب",
  },
  whatsapp: {
    chat: "دردشة",
    chatLabel: "تحدث معنا عبر واتساب",
    greeting: "مرحباً Doodlzz! عندي سؤال.",
  },
  cart: {
    title: "سلة التسوق",
    empty: "سلتك فارغة.",
    keepShopping: "متابعة التسوق",
    remove: "إزالة",
    decrease: "إنقاص الكمية",
    increase: "زيادة الكمية",
    quantity: "الكمية",
    subtotal: "المجموع",
    deliveryNote: "يتم تأكيد رسوم التوصيل عبر واتساب.",
    checkout: "أرسل الطلب عبر واتساب",
    orderIntro: "مرحباً Doodlzz! أريد أن أطلب:",
    orderTotal: "المجموع",
  },
  notFound: {
    title: "الصفحة غير موجودة",
    text: "لم نتمكن من إيجاد هذه الصفحة.",
    home: "العودة إلى الرئيسية",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
