"use client";

import Image from "next/image";
import { useState } from "react";
import { shrinkImage } from "@/components/admin/product-form";
import { useCatalog } from "@/components/catalog-provider";
import { CategoryIcon } from "@/components/icons";
import { categories } from "@/data/catalog";
import { PRODUCT_IMAGES_BUCKET, getSupabase } from "@/lib/supabase";

/** Photo for each category tile on the home page. */
export function AdminCategories() {
  const { categoryImages, reload } = useCatalog();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function upload(slug: string, file: File | undefined) {
    const supabase = getSupabase();
    if (!supabase || !file) return;
    setBusy(slug);
    setError("");
    const blob = await shrinkImage(file);
    const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
    const path = `categories/${slug}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, blob, { contentType: blob.type || file.type, cacheControl: "31536000" });
    if (uploadError) {
      setError(`Photo upload failed: ${uploadError.message}`);
      setBusy(null);
      return;
    }
    const image = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
    const { error: saveError } = await supabase
      .from("category_images")
      .upsert({ slug, image, updated_at: new Date().toISOString() });
    if (saveError) {
      setError(
        saveError.code === "PGRST205" || saveError.code === "42P01"
          ? "The category photos table is missing. Run supabase/004_category_images.sql in the Supabase SQL Editor first."
          : saveError.message,
      );
    }
    await reload();
    setBusy(null);
  }

  async function remove(slug: string) {
    const supabase = getSupabase();
    if (!supabase || !confirm("Remove this photo? The tile goes back to the icon.")) return;
    setBusy(slug);
    const { error: err } = await supabase.from("category_images").delete().eq("slug", slug);
    if (err) setError(err.message);
    await reload();
    setBusy(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        The first photo of each group is the category tile on the home page; the others are the round subcategory pictures on the category page. Square photos look best. Without a photo, the icon is shown.
      </p>
      {error && <p className="rounded-xl bg-pastel-peach p-3 text-sm font-bold text-accent-dark">{error}</p>}
      {categories.map((cat) => (
      <section key={cat.slug} className="flex flex-col gap-2 pt-2">
      <h3 className="text-sm font-extrabold uppercase tracking-[0.05em] text-muted">{cat.name.en}</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {[
          { slug: cat.slug, name: `${cat.name.en} (home page tile)`, isTile: true },
          ...cat.subs.map((s) => ({ slug: s.slug, name: s.name.en, isTile: false })),
        ].map((c) => {
          const image = categoryImages[c.slug];
          return (
            <li key={c.slug} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <div className={`relative flex size-16 flex-none items-center justify-center overflow-hidden ${c.isTile ? "rounded-xl" : "rounded-full"} ${cat.tint}`}>
                {image ? (
                  <Image src={image} alt="" fill unoptimized sizes="64px" className="object-cover" />
                ) : (
                  <CategoryIcon name={cat.icon} size={32} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{c.name}</p>
                <p className="text-xs text-muted">{image ? "Photo" : "Icon (no photo yet)"}</p>
              </div>
              <label
                className={`flex h-9 flex-none cursor-pointer items-center rounded-full bg-navy px-3.5 text-xs font-extrabold text-white ${busy === c.slug ? "opacity-60" : ""}`}
              >
                {busy === c.slug ? "Saving…" : image ? "Change" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={busy !== null}
                  onChange={(e) => {
                    void upload(c.slug, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {image && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => remove(c.slug)}
                  className="min-h-9 flex-none cursor-pointer px-1 text-xs font-bold text-accent-dark underline"
                >
                  Remove
                </button>
              )}
            </li>
          );
        })}
      </ul>
      </section>
      ))}
    </div>
  );
}
