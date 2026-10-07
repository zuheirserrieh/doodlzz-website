"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCartLines } from "@/components/cart-view";
import { GiftWrapToggle, useGiftWrapFee } from "@/components/gift-wrap-toggle";
import { ChevronIcon, CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { ProductImage, productHref } from "@/components/product-card";
import { useDict, usePrice, useStore } from "@/components/store-provider";

/** Cart that slides in from the side when the cart icon is tapped. */
export function CartDrawer() {
  const { locale, cartOpen, setCartOpen, setQty, removeFromCart, orderNote, setOrderNote } = useStore();
  const t = useDict();
  const price = usePrice();
  const { lines, subtotal } = useCartLines();
  const wrapFee = useGiftWrapFee();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  useEffect(() => {
    setCartOpen(false);
  }, [pathname, setCartOpen]);

  useEffect(() => {
    if (!cartOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [cartOpen, setCartOpen]);

  const stepper = "flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-white";

  return (
    <div className={`fixed inset-0 z-50 transition-[visibility] ${cartOpen ? "visible" : "invisible delay-200"}`} inert={!cartOpen}>
      <div
        className={`absolute inset-0 bg-navy/40 transition-opacity duration-200 ${cartOpen ? "opacity-100" : "opacity-0"}`}
        onClick={() => setCartOpen(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.cartDrawer.title(count)}
        className={`absolute inset-y-0 end-0 flex w-full max-w-[420px] flex-col bg-[#f4f5fb] shadow-xl transition-transform duration-200 ${
          cartOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex h-16 flex-none items-center justify-between border-b border-line bg-white ps-4 pe-2">
          <h2 className="text-lg font-extrabold">{t.cartDrawer.title(count)}</h2>
          <button
            type="button"
            aria-label={t.cartDrawer.close}
            onClick={() => setCartOpen(false)}
            className="flex size-11 cursor-pointer items-center justify-center rounded-xl hover:bg-surface"
          >
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-muted">{t.cart.empty}</p>
            <Link href={`/${locale}/shop`} className="flex h-12 items-center rounded-full bg-accent px-6 font-extrabold text-white hover:text-white">
              {t.cart.keepShopping}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4">
              {lines.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-3 border-b border-line py-4">
                  <Link href={productHref(locale, product.slug)} className="w-20 flex-none">
                    <ProductImage product={product} iconSize={32} className="aspect-square rounded-xl bg-white" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <Link href={productHref(locale, product.slug)} className="flex-1 text-sm leading-snug font-bold">
                        {product.name[locale]}
                      </Link>
                      <button
                        type="button"
                        aria-label={`${t.cart.remove}: ${product.name[locale]}`}
                        onClick={() => removeFromCart(product.id)}
                        className="flex size-8 flex-none cursor-pointer items-center justify-center rounded-full hover:bg-white"
                      >
                        <CloseIcon size={18} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div role="group" aria-label={t.cart.quantity} className="flex items-center rounded-full border border-[#dfe3ea] bg-white">
                        <button type="button" aria-label={t.cart.decrease} onClick={() => setQty(product.id, qty - 1)} className={stepper}>
                          <MinusIcon size={16} />
                        </button>
                        <span className="min-w-6 text-center text-sm font-extrabold">{qty}</span>
                        <button type="button" aria-label={t.cart.increase} onClick={() => setQty(product.id, qty + 1)} className={stepper}>
                          <PlusIcon size={16} />
                        </button>
                      </div>
                      <span className="font-extrabold">{price(product.priceUsd * qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-none flex-col gap-3 border-t border-line bg-white p-4">
              <button
                type="button"
                aria-expanded={noteOpen}
                onClick={() => setNoteOpen((o) => !o)}
                className="flex h-11 cursor-pointer items-center justify-between rounded-full bg-surface px-4 text-sm font-bold"
              >
                {t.cartDrawer.orderNote}
                <ChevronIcon size={16} className={noteOpen ? "rotate-90" : "rtl:rotate-180"} />
              </button>
              {noteOpen && (
                <textarea
                  aria-label={t.cartDrawer.orderNote}
                  placeholder={t.cartDrawer.orderNotePlaceholder}
                  maxLength={600}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="h-20 rounded-xl border border-[#dfe3ea] p-3 text-sm outline-none focus:border-navy"
                />
              )}
              <GiftWrapToggle />
              <div className="flex items-baseline justify-between">
                <span className="font-extrabold">{t.cartDrawer.estimatedTotal}</span>
                <span className="text-lg font-extrabold">{price(subtotal + wrapFee)}</span>
              </div>
              <p className="-mt-2 text-xs text-muted">{t.cartDrawer.feesNote}</p>
              <div className="grid grid-cols-2 gap-2.5">
                <Link href={`/${locale}/cart`} className="flex h-12 items-center justify-center rounded-full bg-surface text-sm font-extrabold">
                  {t.cartDrawer.viewCart}
                </Link>
                <Link
                  href={`/${locale}/checkout`}
                  className="flex h-12 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white hover:bg-accent-dark hover:text-white"
                >
                  {t.cartDrawer.checkout}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
