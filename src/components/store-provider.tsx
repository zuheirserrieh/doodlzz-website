"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/components/catalog-provider";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

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
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  /** Note typed in the cart panel; carried into the checkout notes. */
  orderNote: string;
  setOrderNote: (note: string) => void;
  /** Customer wants the order gift-wrapped. */
  giftWrap: boolean;
  setGiftWrap: (on: boolean) => void;
};

const StoreContext = createContext<Store | null>(null);

const CART_KEY = "dz-cart";
const WISHLIST_KEY = "dz-wishlist";
const NOTE_KEY = "dz-order-note";
const WRAP_KEY = "dz-gift-wrap";

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
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNote, setOrderNoteState] = useState("");
  const [giftWrap, setGiftWrapState] = useState(false);
  const setGiftWrap = useCallback((on: boolean) => {
    setGiftWrapState(on);
    writeStorage(WRAP_KEY, on);
  }, []);
  const setOrderNote = useCallback((note: string) => {
    setOrderNoteState(note);
    writeStorage(NOTE_KEY, note);
  }, []);

  // Load persisted state after mount so server and first client render match.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCart(readStorage<CartLine[]>(CART_KEY, []));
    setWishlist(readStorage<string[]>(WISHLIST_KEY, []));
    setOrderNoteState(readStorage<string>(NOTE_KEY, ""));
    setGiftWrapState(readStorage<boolean>(WRAP_KEY, false));
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(CART_KEY, cart);
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) writeStorage(WISHLIST_KEY, wishlist);
  }, [wishlist, hydrated]);

  // ── Signed-in customers: cart & favorites are also kept in their account ──
  const userId = useAuth().session?.user.id;
  const [syncedUser, setSyncedUser] = useState<string | null>(null);

  // On sign-in, merge what's saved in the account with what's in this browser.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !hydrated || !userId) {
      setSyncedUser(null); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    let cancelled = false;
    supabase
      .from("user_data")
      .select("cart, wishlist")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Could not load saved cart/favorites", error);
          return;
        }
        if (data) {
          const saved = data as { cart: CartLine[]; wishlist: string[] };
          setCart((local) => {
            const merged = new Map(local.map((l) => [l.id, l.qty]));
            for (const l of saved.cart ?? []) merged.set(l.id, Math.max(merged.get(l.id) ?? 0, l.qty));
            return [...merged].map(([id, qty]) => ({ id, qty }));
          });
          setWishlist((local) => [...new Set([...local, ...(saved.wishlist ?? [])])]);
        }
        setSyncedUser(userId);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, hydrated]);

  // After that, save every change to the account (debounced).
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId || syncedUser !== userId) return;
    const timer = setTimeout(() => {
      supabase
        .from("user_data")
        .upsert({ user_id: userId, cart, wishlist, updated_at: new Date().toISOString() })
        .then(({ error }) => error && console.error("Could not save cart/favorites", error));
    }, 800);
    return () => clearTimeout(timer);
  }, [cart, wishlist, userId, syncedUser]);

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
      cartOpen,
      setCartOpen,
      orderNote,
      setOrderNote,
      giftWrap,
      setGiftWrap,
    }),
    [locale, cart, addToCart, setQty, removeFromCart, clearCart, wishlist, isWished, toggleWish, menuOpen, cartOpen, orderNote, setOrderNote, giftWrap, setGiftWrap],
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
