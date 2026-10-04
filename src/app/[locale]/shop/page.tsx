import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/shop-view";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).listing.allProducts };
}

export default function ShopPage() {
  // useSearchParams needs a Suspense boundary so the page can be pre-rendered statically.
  return (
    <Suspense>
      <ShopView />
    </Suspense>
  );
}
