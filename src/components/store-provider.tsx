"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

export type CartLine = { id: string; qty: number };

type Store = {
  locale: Locale;
  cart: CartLine[];
  cartCount: number;
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  wishlist: string[];
  isWished: (id: string) => boolean;
  toggleWish: (id: string) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
};

const StoreContext = createContext<Store | null>(null);

const CART_KEY = "dz-cart";
const WISHLIST_KEY = "dz-wishlist";

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
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load persisted state after mount so server and first client render match.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCart(readStorage<CartLine[]>(CART_KEY, []));
    setWishlist(readStorage<string[]>(WISHLIST_KEY, []));
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(CART_KEY, cart);
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(WISHLIST_KEY, wishlist);
  }, [wishlist, hydrated]);

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

  const toggleWish = useCallback((id: string) => {
    setWishlist((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }, []);
  const isWished = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const value = useMemo<Store>(
    () => ({
      locale,
      cart,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      wishlist,
      isWished,
      toggleWish,
      menuOpen,
      setMenuOpen,
    }),
    [locale, cart, addToCart, setQty, removeFromCart, clearCart, wishlist, isWished, toggleWish, menuOpen],
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

/** Prices are US dollars only, "$149" / "$149.50" style in both languages. */
export function formatPrice(usd: number) {
  const digits = Number.isInteger(usd) ? 0 : 2;
  return `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(usd)}`;
}

export function usePrice() {
  return formatPrice;
}
