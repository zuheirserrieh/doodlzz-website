"use client";

import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";
import { ageGroups, categories } from "@/data/catalog";
import type { ProductRow } from "@/data/products";
import { PRODUCT_IMAGES_BUCKET, getSupabase } from "@/lib/supabase";

export const emptyRow: ProductRow = {
  id: "",
  slug: "",
  name_en: "",
  name_ar: "",
  description_en: "",
  description_ar: "",
  category: categories[0].slug,
  ages: [],
  price_usd: "",
  compare_at_usd: null,
  images: [],
  best_seller: false,
  is_new: true,
  active: true,
  sort: 0,
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Shrink phone photos (often 4–8 MB) to ≤1600px WebP before uploading. */
async function shrinkImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    return blob ?? file;
  } catch {
    return file; // unsupported format: upload as-is
  }
}

/** Storage path of a photo in our bucket, from its public URL (null for outside URLs). */
function storagePath(url: string) {
  const marker = `/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

const input =
  "h-11 w-full rounded-xl border border-[#dfe3ea] bg-white px-3 text-[15px] font-semibold outline-none focus:border-navy focus:ring-2 focus:ring-navy/15";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function ProductForm({ initial, onDone, onCancel }: { initial: ProductRow; onDone: () => void; onCancel: () => void }) {
  const isNew = !initial.id;
  const [row, setRow] = useState<ProductRow>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof ProductRow>(key: K, value: ProductRow[K]) => setRow((r) => ({ ...r, [key]: value }));

  async function upload(files: FileList | null) {
    const supabase = getSupabase();
    if (!supabase || !files?.length) return;
    setError("");
    setUploading(files.length);
    for (const file of Array.from(files)) {
      const blob = await shrinkImage(file);
      const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error: err } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, blob, { contentType: blob.type || file.type, cacheControl: "31536000" });
      if (err) {
        setError(`Photo upload failed: ${err.message}`);
      } else {
        const url = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
        setRow((r) => ({ ...r, images: [...r.images, url] }));
      }
      setUploading((n) => n - 1);
    }
  }

  function moveImage(index: number, to: number) {
    setRow((r) => {
      const images = [...r.images];
      const [img] = images.splice(index, 1);
      images.splice(to, 0, img);
      return { ...r, images };
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    const price = Number(row.price_usd);
    const compare = row.compare_at_usd === null || row.compare_at_usd === "" ? null : Number(row.compare_at_usd);
    const slug = slugify(row.slug || row.name_en);
    if (!slug) {
      setError("Please enter an English name (it is used for the product link).");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid price.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      slug,
      name_en: row.name_en.trim(),
      name_ar: row.name_ar.trim(),
      description_en: row.description_en.trim(),
      description_ar: row.description_ar.trim(),
      category: row.category,
      ages: row.ages,
      price_usd: price,
      compare_at_usd: compare,
      images: row.images,
      best_seller: row.best_seller,
      is_new: row.is_new,
      active: row.active,
      sort: Number(row.sort) || 0,
    };
    const { error: err } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", row.id);
    setSaving(false);
    if (err) {
      setError(err.code === "23505" ? "Another product already uses this link (slug). Change the slug." : err.message);
      return;
    }
    onDone();
  }

  async function remove() {
    const supabase = getSupabase();
    if (!supabase || !confirm(`Delete "${row.name_en}" permanently? (To keep it but hide it from the shop, untick "Visible in shop" instead.)`))
      return;
    setSaving(true);
    const { error: err } = await supabase.from("products").delete().eq("id", row.id);
    if (err) {
      setSaving(false);
      setError(err.message);
      return;
    }
    const paths = row.images.map(storagePath).filter((p): p is string => Boolean(p));
    if (paths.length) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
    onDone();
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">{isNew ? "Add product" : "Edit product"}</h2>
        <button type="button" onClick={onCancel} className="min-h-10 cursor-pointer text-sm font-bold text-muted underline">
          Cancel
        </button>
      </div>

      {/* Photos */}
      <section className="flex flex-col gap-2">
        <span className="text-sm font-bold">Photos</span>
        <div className="flex flex-wrap gap-2">
          {row.images.map((src, i) => (
            <div key={src} className="relative size-24 overflow-hidden rounded-xl bg-surface">
              <Image src={src} alt="" fill unoptimized sizes="96px" className="object-cover" />
              {i === 0 && <span className="absolute start-1 top-1 rounded-full bg-navy px-2 text-[10px] font-extrabold text-white">Main</span>}
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                {i > 0 ? (
                  <button type="button" onClick={() => moveImage(i, 0)} className="cursor-pointer rounded-full bg-white/90 px-2 text-[10px] font-extrabold">
                    Make main
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => set("images", row.images.filter((_, n) => n !== i))}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-xs font-extrabold"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#c9cfdc] text-center text-xs font-bold text-muted hover:border-navy">
            <span className="text-2xl leading-none">+</span>
            {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
        <span className="text-xs text-muted">The first photo is the main one shown in the shop.</span>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (English) *">
          <input
            className={input}
            required
            value={row.name_en}
            onChange={(e) => {
              set("name_en", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Name (Arabic)" hint="Shown on the Arabic site. Leave empty to use the English name.">
          <input className={input} dir="rtl" value={row.name_ar} onChange={(e) => set("name_ar", e.target.value)} />
        </Field>

        <Field label="Category *">
          <select className={input} value={row.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name.en}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Link (slug)" hint={`Page address: /product?slug=${slugify(row.slug || row.name_en) || "…"}`}>
          <input
            className={input}
            dir="ltr"
            value={row.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
          />
        </Field>

        <Field label="Price (USD) *">
          <input
            className={input}
            required
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            dir="ltr"
            value={row.price_usd}
            onChange={(e) => set("price_usd", e.target.value)}
          />
        </Field>
        <Field label="Old price (USD)" hint="Optional. Fill in to show a sale: the old price appears crossed out.">
          <input
            className={input}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            dir="ltr"
            value={row.compare_at_usd ?? ""}
            onChange={(e) => set("compare_at_usd", e.target.value === "" ? null : e.target.value)}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">Suitable ages</legend>
        <div className="flex flex-wrap gap-2">
          {ageGroups.map((a) => {
            const on = row.ages.includes(a.slug);
            return (
              <label key={a.slug} className={`flex h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-bold ${on ? "bg-navy text-white" : "bg-surface"}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => set("ages", on ? row.ages.filter((x) => x !== a.slug) : [...row.ages, a.slug])}
                />
                {a.label} {a.unit}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Description (English)">
          <textarea className={`${input} h-32 py-2`} value={row.description_en} onChange={(e) => set("description_en", e.target.value)} />
        </Field>
        <Field label="Description (Arabic)">
          <textarea className={`${input} h-32 py-2`} dir="rtl" value={row.description_ar} onChange={(e) => set("description_ar", e.target.value)} />
        </Field>
      </div>

      <fieldset className="flex flex-wrap gap-x-6 gap-y-3">
        <legend className="mb-2 text-sm font-bold">Show in shop</legend>
        {(
          [
            ["active", "Visible in shop"],
            ["best_seller", "Best seller"],
            ["is_new", "New arrival"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex min-h-10 cursor-pointer items-center gap-2 font-bold">
            <input type="checkbox" className="size-5 accent-navy" checked={row[key]} onChange={(e) => set(key, e.target.checked)} />
            {label}
          </label>
        ))}
        <label className="flex items-center gap-2 font-bold">
          Order
          <input
            className={`${input} w-20`}
            type="number"
            dir="ltr"
            value={row.sort}
            onChange={(e) => set("sort", Number(e.target.value))}
            title="Lower numbers are shown first"
          />
        </label>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-xl bg-pastel-peach p-3 text-sm font-bold text-accent-dark">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading > 0}
          className="h-12 cursor-pointer rounded-full bg-accent px-8 font-extrabold text-white hover:bg-accent-dark disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? "Saving…" : isNew ? "Add product" : "Save changes"}
        </button>
        {!isNew && (
          <button type="button" onClick={remove} disabled={saving} className="ms-auto min-h-10 cursor-pointer text-sm font-bold text-accent-dark underline">
            Delete product
          </button>
        )}
      </div>
    </form>
  );
}
