import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";
import { CatalogProvider } from "@/components/catalog-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MenuDrawer } from "@/components/menu-drawer";
import { StoreProvider } from "@/components/store-provider";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { dirOf, getDictionary, isLocale, locales } from "@/lib/i18n";
import "../globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const tajawal = Tajawal({ variable: "--font-arabic", subsets: ["arabic"], weight: ["400", "500", "700", "800"] });

// Only the pages generated at build time exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: { default: "Doodlzz — Baby & Kids Store in Lebanon", template: "%s · Doodlzz" },
    description: t.hero.slides[0].text,
    alternates: { languages: { en: "/en", ar: "/ar" } },
  };
}

export const viewport: Viewport = {
  themeColor: "#1E2742",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      className={`${fredoka.variable} ${nunito.variable} ${tajawal.variable}`}
    >
      <body className="min-h-dvh">
        <CatalogProvider>
        <StoreProvider locale={locale}>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <MenuDrawer />
          <WhatsAppFab />
        </StoreProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
