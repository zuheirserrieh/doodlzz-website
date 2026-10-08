"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/components/catalog-provider";
import { getDictionary, type Locale } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

/**
 * wrap = customer asked for gift wrap on this item (only kept if the product offers it).
 * color = colour the customer picked; the same product in two colours is two lines.
 */
export type CartLine = { id: string; qty: number; wrap?: boolean; color?: string };

/** Identifies a cart line (product + chosen colour). */
export const lineKey = (l: { id: string; color?: string }) => (l.color ? `${l.id}|${l.color}` : l.id);

type Store = {
  locale: Locale;
  cart: CartLine[];
  cartCount: number;
  addToCart: (id: string, qty?: number, wrap?: boolean, color?: string) => void;
  /** The functions below take a line key (see lineKey). */
  setWrap: (key: string, wrap: boolean) => void;
  setColor: (key: string, color: string) => void;
  setQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
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
};

const StoreContext = createContext<Store | null>(null);

const CART_KEY = "dz-cart";
const WISHLIST_KEY = "dz-wishlist";
const NOTE_KEY = "dz-order-note";

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
            const merged = new Map(local.map((l) => [lineKey(l), l]));
            for (const l of saved.cart ?? []) {
              const mine = merged.get(lineKey(l));
              merged.set(lineKey(l), mine ? { ...mine, qty: Math.max(mine.qty, l.qty) } : l);
            }
            return [...merged.values()];
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

  const addToCart = useCallback((id: string, qty = 1, wrap?: boolean, color?: string) => {
    setCart((lines) => {
      const key = lineKey({ id, color });
      if (lines.some((l) => lineKey(l) === key)) {
        return lines.map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + qty, wrap: wrap ?? l.wrap } : l));
      }
      return [...lines, { id, qty, wrap: Boolean(wrap), ...(color ? { color } : {}) }];
    });
  }, []);

  const setWrap = useCallback((key: string, wrap: boolean) => {
    setCart((lines) => lines.map((l) => (lineKey(l) === key ? { ...l, wrap } : l)));
  }, []);

  // Picking a colour in the cart; joins an existing line of that colour if there is one.
  const setColor = useCallback((key: string, color: string) => {
    setCart((lines) => {
      const line = lines.find((l) => lineKey(l) === key);
      if (!line) return lines;
      const target = lineKey({ id: line.id, color });
      if (target === key) return lines;
      const twin = lines.find((l) => lineKey(l) === target);
      if (twin) {
        return lines.filter((l) => lineKey(l) !== key).map((l) => (l === twin ? { ...l, qty: l.qty + line.qty } : l));
      }
      return lines.map((l) => (l === line ? { ...l, color } : l));
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setCart((lines) =>
      qty <= 0 ? lines.filter((l) => lineKey(l) !== key) : lines.map((l) => (lineKey(l) === key ? { ...l, qty } : l)),
    );
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((lines) => lines.filter((l) => lineKey(l) !== key));
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
      setWrap,
      setColor,
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
    }),
    [locale, cart, addToCart, setWrap, setColor, setQty, removeFromCart, clearCart, wishlist, isWished, toggleWish, menuOpen, cartOpen, orderNote, setOrderNote],
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
