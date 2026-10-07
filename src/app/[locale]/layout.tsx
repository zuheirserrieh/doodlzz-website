import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { CartDrawer } from "@/components/cart-drawer";
import { CatalogProvider } from "@/components/catalog-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MenuDrawer } from "@/components/menu-drawer";
import { StoreProvider } from "@/components/store-provider";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { dirOf, getDictionary, isLocale, locales } from "@/lib/i18n";
import { fontPreviewScript, fontVariables, splashScript } from "@/lib/fonts";
import "../globals.css";

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
    // Short title + description: this is what WhatsApp/Instagram show when the link is shared.
    metadataBase: new URL("https://doodlzz-website.doodlzzlb.workers.dev"),
    title: { default: t.meta.title, template: "%s · Doodlzz" },
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      siteName: "Doodlzz",
      locale: locale === "ar" ? "ar_LB" : "en_US",
      type: "website",
      images: [{ url: "/brand/logo-doodlzz.jpg", width: 1280, height: 799, alt: "Doodlzz" }],
    },
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
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: fontPreviewScript + splashScript }} />
      </head>
      <body className="site-bg min-h-dvh">
        {/* Entrance animation (CSS only, see globals.css). */}
        <div id="dz-splash" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand image */}
          <img src="/brand/splash-logo.webp" alt="" width={600} height={575} fetchPriority="high" />
        </div>
        <CatalogProvider>
        <StoreProvider locale={locale}>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <MenuDrawer />
          <CartDrawer />
          <WhatsAppFab />
        </StoreProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
