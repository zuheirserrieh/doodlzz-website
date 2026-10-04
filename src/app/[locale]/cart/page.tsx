import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).cart.title, robots: { index: false } };
}

export default function CartPage() {
  return <CartView />;
}
