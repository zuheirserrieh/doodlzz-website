import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public values, baked into the static build. Set them in `.env.local` for development
// and as build variables in Cloudflare. The anon/publishable key is safe to expose:
// what it can do is limited by the row-level security rules in supabase/schema.sql.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** The shared Supabase client, or null when the database isn't configured yet. */
export function getSupabase(): SupabaseClient | null {
  if (!url || !key) return null;
  if (typeof window === "undefined") return null; // static site: data is only loaded in the browser
  client ??= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export const supabaseConfigured = Boolean(url && key);

export const PRODUCT_IMAGES_BUCKET = "product-images";
