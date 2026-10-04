import type { Metadata } from "next";
import { AccountView } from "@/components/account-view";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/account">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).account.title, robots: { index: false } };
}

export default function AccountPage() {
  return <AccountView />;
}
