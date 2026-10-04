import { Suspense } from "react";
import { ProductView } from "@/components/product-view";

// One static page for every product: it reads ?slug= and loads the product in the
// browser, so products added in the admin panel work without rebuilding the site.
export default function ProductPage() {
  return (
    <Suspense>
      <ProductView />
    </Suspense>
  );
}
