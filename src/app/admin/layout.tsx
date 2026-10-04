import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { CatalogProvider } from "@/components/catalog-provider";
import "../globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Doodlzz Admin",
  robots: { index: false, follow: false },
};

// The admin panel has its own root layout (English only, no shop header/footer).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" dir="ltr" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="min-h-dvh bg-surface">
        <CatalogProvider>{children}</CatalogProvider>
      </body>
    </html>
  );
}
