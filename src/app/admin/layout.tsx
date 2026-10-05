import type { Metadata } from "next";
import { CatalogProvider } from "@/components/catalog-provider";
import { fontPreviewScript, fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Doodlzz Admin",
  robots: { index: false, follow: false },
};

// The admin panel has its own root layout (English only, no shop header/footer).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" dir="ltr" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: fontPreviewScript }} />
      </head>
      <body className="min-h-dvh bg-surface">
        <CatalogProvider>{children}</CatalogProvider>
      </body>
    </html>
  );
}
