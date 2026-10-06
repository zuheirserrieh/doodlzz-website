"use client";

import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fromRow, sampleProducts, type Product, type ProductRow } from "@/data/products";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

type Catalog = {
  products: Product[];
  /** False until products have been loaded (from cache or the database). */
  ready: boolean;
  getById: (id: string) => Product | undefined;
  getBySlug: (slug: string) => Product | undefined;
  /** Category slug → photo URL, set in /admin → Categories (missing = icon tile). */
  categoryImages: Record<string, string>;
  reload: () => Promise<void>;
};

type Auth = {
  session: Session | null;
  email: string | null;
  isAdmin: boolean;
  /** False while the admin check for the current session is still running. */
  adminChecked: boolean;
  /** False until the stored session (if any) has been checked. */
  authReady: boolean;
  /** True after opening a password-reset link: the user should now choose a new password. */
  recovery: boolean;
  endRecovery: () => void;
  signOut: () => Promise<void>;
};

const CatalogContext = createContext<Catalog | null>(null);
const AuthContext = createContext<Auth | null>(null);

const CACHE_KEY = "dz-products-v1";
const CATEGORY_CACHE_KEY = "dz-category-images-v1";

function readCache(): Product[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : null;
  } catch {
    return null;
  }
}

function writeCache(products: Product[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(products));
  } catch {
    // ignore — cache is only a speed-up
  }
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  // Without a database the sample catalogue is used (and rendered into the static HTML).
  const [products, setProducts] = useState<Product[]>(supabaseConfigured ? [] : sampleProducts);
  const [ready, setReady] = useState(!supabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  // null = still checking with the database
  const [isAdmin, setIsAdmin] = useState<boolean | null>(false);
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [recovery, setRecovery] = useState(false);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Could not load products", error);
      setReady(true);
      return;
    }
    const list = (data as ProductRow[]).map(fromRow);
    setProducts(list);
    setReady(true);
    writeCache(list);

    // Category photos are optional: if the table isn't set up yet, the icon tiles stay.
    const { data: images } = await supabase.from("category_images").select("slug, image");
    if (images) {
      const map = Object.fromEntries((images as { slug: string; image: string }[]).map((r) => [r.slug, r.image]));
      setCategoryImages(map);
      try {
        localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(map));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Show the last known catalogue instantly, then refresh from the database.
    const cached = readCache();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (cached) {
      setProducts(cached);
      setReady(true);
    }
    try {
      const cachedImages = localStorage.getItem(CATEGORY_CACHE_KEY);
      if (cachedImages) setCategoryImages(JSON.parse(cachedImages));
    } catch {
      // ignore
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    void reload();

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(next);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [reload]);

  // Ask the database whether this account is an admin (same rule the security policies use).
  // Keyed on the user id so routine token refreshes don't re-run the check.
  const userId = session?.user.id;
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId) {
      setIsAdmin(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    setIsAdmin(null);
    let cancelled = false;
    supabase.rpc("is_admin").then(({ data }) => {
      if (!cancelled) setIsAdmin(data === true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const catalog = useMemo<Catalog>(
    () => ({
      products,
      ready,
      getById: (id) => products.find((p) => p.id === id),
      getBySlug: (slug) => products.find((p) => p.slug === slug),
      categoryImages,
      reload,
    }),
    [products, ready, categoryImages, reload],
  );

  const auth = useMemo<Auth>(
    () => ({
      session,
      email: session?.user.email ?? null,
      isAdmin: isAdmin === true,
      adminChecked: isAdmin !== null,
      authReady,
      recovery,
      endRecovery: () => setRecovery(false),
      signOut: async () => {
        await getSupabase()?.auth.signOut();
      },
    }),
    [session, isAdmin, authReady, recovery],
  );

  return (
    <AuthContext.Provider value={auth}>
      <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
    </AuthContext.Provider>
  );
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return value;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <CatalogProvider>");
  return value;
}
