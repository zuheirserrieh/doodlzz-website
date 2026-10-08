"use client";

import Link from "next/link";
import { useCatalog } from "@/components/catalog-provider";
import { ArrowIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { ProductImage, productHref } from "@/components/product-card";
import { lineKey, useDict, usePrice, useStore } from "@/components/store-provider";
import { ColorPicker, productColors } from "@/components/color-picker";
import { GiftWrapOption, wrapFee } from "@/components/gift-wrap-toggle";

export type CartItem = ReturnType<typeof useCartLines>["lines"][number];

/** Cart lines joined with their products (lines whose product was removed are skipped). */
export function useCartLines() {
  const { cart } = useStore();
  const { getById, ready } = useCatalog();
  const lines = cart.flatMap((l) => {
    const product = getById(l.id);
    if (!product) return [];
    const wrap = Boolean(l.wrap && product.giftWrap);
    const colors = productColors(product);
    // A colour that was removed from the product is dropped; a single colour is picked automatically.
    const color = colors.find((c) => c.slug === l.color) ?? (colors.length === 1 ? colors[0] : undefined);
    return [
      {
        key: lineKey(l),
        product,
        qty: l.qty,
        wrap,
        wrapFee: wrapFee(product, l.qty, wrap),
        color,
        needsColor: colors.length > 0 && !color,
      },
    ];
  });
  const itemsTotal = lines.reduce((sum, l) => sum + l.product.priceUsd * l.qty, 0);
  const wrapTotal = lines.reduce((sum, l) => sum + l.wrapFee, 0);
  // subtotal = products + gift wrap (delivery is confirmed on WhatsApp).
  return { lines, itemsTotal, wrapTotal, subtotal: itemsTotal + wrapTotal, ready };
}

/** Colour swatches under a cart line, with a reminder when none is picked yet. */
export function CartLineColor({ item }: { item: CartItem }) {
  const { setColor } = useStore();
  const t = useDict();
  if (productColors(item.product).length < 2) return null;
  return (
    <div className="flex flex-col gap-1">
      <ColorPicker product={item.product} value={item.color?.slug} onChange={(slug) => setColor(item.key, slug)} compact label={t.product.color} />
      {item.needsColor && <span className="text-xs font-extrabold text-accent-dark">{t.product.chooseColor}</span>}
    </div>
  );
}

export function CartView() {
  const { locale, setQty, removeFromCart, setWrap } = useStore();
  const t = useDict();
  const price = usePrice();
  const { lines, subtotal, ready } = useCartLines();

  if (!ready) return <div className="min-h-[50vh]" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">{t.cart.title}</h1>
        <p className="text-muted">{t.cart.empty}</p>
        <Link
          href={`/${locale}/shop`}
          className="flex h-12 items-center rounded-full bg-accent px-6 font-extrabold text-white hover:text-white"
        >
          {t.cart.keepShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 pt-6 md:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <h1 className="font-display text-[28px] font-bold">{t.cart.title}</h1>
        <ul className="mt-4 flex flex-col rounded-3xl bg-white/90 px-4 shadow-sm">
          {lines.map((item) => renderLine(item))}
        </ul>
      </div>

      <aside className="flex h-fit flex-col gap-3 rounded-3xl bg-surface p-5 md:sticky md:top-28">
        <div className="flex items-baseline justify-between text-lg font-extrabold">
          <span>{t.cart.subtotal}</span>
          <span>{price(subtotal)}</span>
        </div>
        <p className="text-sm text-muted">{t.cart.deliveryNote}</p>
        <Link
          href={`/${locale}/checkout`}
          className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-accent text-[15px] font-extrabold text-white hover:bg-accent-dark hover:text-white"
        >
          {t.checkout.title}
          <ArrowIcon className="rtl:rotate-180" />
        </Link>
        <Link href={`/${locale}/shop`} className="text-center text-sm font-bold text-accent">
          {t.cart.keepShopping}
        </Link>
      </aside>
    </div>
  );

  function renderLine(item: CartItem) {
    const { key, product, qty, wrap } = item;
    const stepper = "flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-white";
    return (
      <li key={key} className="flex gap-3 border-b border-line py-4">
        <Link href={productHref(locale, product.slug)} className="w-24 flex-none">
          <ProductImage product={product} iconSize={40} className="aspect-square rounded-2xl" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link href={productHref(locale, product.slug)} className="text-sm font-bold leading-snug">
            {product.name[locale]}
          </Link>
          <span className="text-base font-extrabold">{price(product.priceUsd * qty)}</span>
          <CartLineColor item={item} />
          <GiftWrapOption product={product} checked={wrap} onChange={(on) => setWrap(key, on)} compact className="my-1" />
          <div className="mt-auto flex items-center justify-between">
            <div role="group" aria-label={t.cart.quantity} className="flex items-center rounded-full bg-surface">
              <button type="button" aria-label={t.cart.decrease} onClick={() => setQty(key, qty - 1)} className={stepper}>
                <MinusIcon />
              </button>
              <span className="min-w-6 text-center text-sm font-extrabold" aria-live="polite">
                {qty}
              </span>
              <button type="button" aria-label={t.cart.increase} onClick={() => setQty(key, qty + 1)} className={stepper}>
                <PlusIcon />
              </button>
            </div>
            <button type="button" onClick={() => removeFromCart(key)} className="min-h-10 cursor-pointer px-2 text-sm font-bold text-muted underline">
              {t.cart.remove}
            </button>
          </div>
        </div>
      </li>
    );
  }
}
