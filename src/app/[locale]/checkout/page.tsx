import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout-view";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).checkout.title, robots: { index: false } };
}

export default function CheckoutPage() {
  return <CheckoutView />;
}
