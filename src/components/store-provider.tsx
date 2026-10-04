"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

export type Currency = "usd" | "lbp";
export type CartLine = { id: string; qty: number };

type Store = {
  locale: Locale;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cart: CartLine[];
  cartCount: number;
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

const StoreContext = createContext<Store | null>(null);

const CART_KEY = "dz-cart";
const CURRENCY_KEY = "dz-currency";

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode etc.) — state still works for this visit.
  }
}

export function StoreProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("usd");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load persisted state after mount so server and first client render match.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCart(readStorage<CartLine[]>(CART_KEY, []));
    setCurrencyState(readStorage<Currency>(CURRENCY_KEY, "usd"));
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(CART_KEY, cart);
  }, [cart, hydrated]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    writeStorage(CURRENCY_KEY, c);
  }, []);

  const addToCart = useCallback((id: string, qty = 1) => {
    setCart((lines) => {
      const existing = lines.find((l) => l.id === id);
      if (existing) return lines.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
      return [...lines, { id, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((lines) =>
      qty <= 0 ? lines.filter((l) => l.id !== id) : lines.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((lines) => lines.filter((l) => l.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo<Store>(
    () => ({
      locale,
      currency,
      setCurrency,
      cart,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      menuOpen,
      setMenuOpen,
    }),
    [locale, currency, setCurrency, cart, addToCart, setQty, removeFromCart, clearCart, menuOpen],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}

export function useDict() {
  return getDictionary(useStore().locale);
}

export function formatPrice(usd: number, currency: Currency, locale: Locale) {
  const tag = locale === "ar" ? "ar-LB-u-nu-latn" : "en-US";
  if (currency === "lbp") {
    const lbp = Math.round((usd * site.lbpPerUsd) / 1000) * 1000;
    return `${new Intl.NumberFormat(tag).format(lbp)} ${locale === "ar" ? "ل.ل." : "LBP"}`;
  }
  return new Intl.NumberFormat(tag, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(usd);
}

export function usePrice() {
  const { currency, locale } = useStore();
  return useCallback((usd: number) => formatPrice(usd, currency, locale), [currency, locale]);
}
