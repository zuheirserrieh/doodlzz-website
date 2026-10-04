import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites-view";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/favorites">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).wishlist.title, robots: { index: false } };
}

export default function FavoritesPage() {
  return <FavoritesView />;
}
