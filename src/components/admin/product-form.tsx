"use client";

import Image from "next/image";
import { useState, type FormEvent, type ReactNode } from "react";
import { ageGroups, categories, colorPalette, customColorSlug, getCategory, getColor } from "@/data/catalog";
import type { ProductRow } from "@/data/products";
import { ImageCropper } from "@/components/admin/image-cropper";
import { MAX_VIDEO_MB, isVideo } from "@/lib/media";
import { RelatedPicker } from "@/components/admin/related-picker";
import { PRODUCT_IMAGES_BUCKET, getSupabase } from "@/lib/supabase";

export const emptyRow: ProductRow = {
  id: "",
  slug: "",
  name_en: "",
  name_ar: "",
  description_en: "",
  description_ar: "",
  category: categories[0].slug,
  subcategory: "",
  ages: [],
  genders: [],
  price_usd: "",
  compare_at_usd: null,
  images: [],
  best_seller: false,
  limited_quantity: false,
  last_piece: false,
  on_offer: false,
  gift_wrap: false,
  gift_wrap_price: 0,
  related: [],
  brand: "",
  colors: [],
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
export async function shrinkImage(file: File): Promise<Blob> {
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

/** "+ Add a color" — pick any shade and give it a name. */
function CustomColorAdder({ onAdd }: { onAdd: (slug: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState("#7fd1b9");
  const [en, setEn] = useState("");
  const [ar, setAr] = useState("");

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-10 w-fit cursor-pointer rounded-full border-2 border-dashed border-navy/40 px-4 text-sm font-extrabold">
        + Add a color
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3">
      <div className="flex items-center gap-3">
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} aria-label="Color" className="size-12 cursor-pointer rounded-xl border-0 bg-transparent p-0" />
        <span className="text-xs text-muted">Tap the square to choose the shade.</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name (English)">
          <input className={input} value={en} maxLength={30} onChange={(e) => setEn(e.target.value)} placeholder="e.g. Mint" />
        </Field>
        <Field label="Name (Arabic, optional)">
          <input className={input} dir="rtl" value={ar} maxLength={30} onChange={(e) => setAr(e.target.value)} placeholder="مثلاً: نعناعي" />
        </Field>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!en.trim()}
          onClick={() => {
            onAdd(customColorSlug(hex, en, ar));
            setEn("");
            setAr("");
            setOpen(false);
          }}
          className="h-10 cursor-pointer rounded-full bg-navy px-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add color
        </button>
        <button type="button" onClick={() => setOpen(false)} className="h-10 cursor-pointer rounded-full px-4 text-sm font-bold text-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ProductForm({
  initial,
  allProducts,
  onDone,
  onCancel,
}: {
  initial: ProductRow;
  /** Every product, for the "Goes well with" picker. */
  allProducts: ProductRow[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const isNew = !initial.id;
  const [row, setRow] = useState<ProductRow>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof ProductRow>(key: K, value: ProductRow[K]) => setRow((r) => ({ ...r, [key]: value }));

  // Photos waiting for the cropper, one at a time. replaceIndex = re-cropping an existing photo.
  const [cropQueue, setCropQueue] = useState<{ src: string; file?: File; replaceIndex?: number }[]>([]);
  const cropping = cropQueue[0];

  function queueFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const all = Array.from(files);
    // Videos skip the cropper and upload as they are; photos go through the cropper.
    all.filter((f) => f.type.startsWith("video/")).forEach((f) => void uploadVideo(f));
    const photos = all.filter((f) => !f.type.startsWith("video/"));
    setCropQueue((q) => [...q, ...photos.map((file) => ({ src: URL.createObjectURL(file), file }))]);
  }

  async function uploadVideo(file: File) {
    const supabase = getSupabase();
    if (!supabase) return;
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`"${file.name}" is ${Math.round(file.size / 1024 / 1024)} MB. Videos can be up to ${MAX_VIDEO_MB} MB; shorten or compress it first.`);
      return;
    }
    setUploading((n) => n + 1);
    const ext = (file.name.split(".").pop() ?? "mp4").toLowerCase();
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error: err } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type || "video/mp4", cacheControl: "31536000" });
    if (err) {
      setError(`Video upload failed: ${err.message}`);
    } else {
      const url = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
      setRow((r) => ({ ...r, images: [...r.images, url] }));
    }
    setUploading((n) => n - 1);
  }

  function nextCrop() {
    setCropQueue((q) => {
      if (q[0]?.file) URL.revokeObjectURL(q[0].src);
      return q.slice(1);
    });
  }

  async function finishCrop(result: Blob | null) {
    const item = cropping;
    if (!item) return;
    nextCrop();
    // "Keep original": new files are still shrunk; an existing photo simply stays as it is.
    const blob = result ?? (item.file ? await shrinkImage(item.file) : null);
    if (!blob) return;
    const supabase = getSupabase();
    if (!supabase) return;
    setUploading((n) => n + 1);
    const ext = blob.type === "image/webp" ? "webp" : (item.file?.name.split(".").pop() ?? "jpg");
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error: err } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, blob, { contentType: blob.type || item.file?.type, cacheControl: "31536000" });
    if (err) {
      setError(`Photo upload failed: ${err.message}`);
    } else {
      const url = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
      setRow((r) => {
        if (item.replaceIndex === undefined) return { ...r, images: [...r.images, url] };
        const images = [...r.images];
        images[item.replaceIndex] = url;
        return { ...r, images };
      });
    }
    setUploading((n) => n - 1);
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
      subcategory: row.subcategory ?? "",
      // Extras that repeat the main category/subcategory are dropped.
      extra_categories: [...new Set(row.extra_categories ?? [])]
        .filter((s) => s !== (row.subcategory ? `${row.category}/${row.subcategory}` : row.category))
        .slice(0, 2),
      ages: row.ages,
      genders: row.genders ?? [],
      price_usd: price,
      compare_at_usd: compare,
      images: row.images,
      best_seller: row.best_seller,
      limited_quantity: Boolean(row.limited_quantity),
      last_piece: Boolean(row.last_piece),
      on_offer: Boolean(row.on_offer),
      gift_wrap: Boolean(row.gift_wrap),
      gift_wrap_price: Math.min(10, Math.max(0, Number(row.gift_wrap_price) || 0)),
      brand: (row.brand ?? "").trim(),
      colors: row.colors ?? [],
      related: row.related ?? [],
      is_new: row.is_new,
      active: row.active,
      sort: Number(row.sort) || 0,
    };
    const { data: saved, error: err } = isNew
      ? await supabase.from("products").insert(payload).select("id").single()
      : await supabase.from("products").update(payload).eq("id", row.id).select("id").single();
    if (err) {
      setSaving(false);
      setError(err.code === "23505" ? "Another product already uses this link (slug). Change the slug." : err.message);
      return;
    }
    // The item code lives in its own admin-only table.
    const code = (row.code ?? "").trim();
    if (code !== (initial.code ?? "") || (isNew && code)) {
      const { error: codeErr } = await supabase.from("product_codes").upsert({ product_id: saved.id, code });
      if (codeErr) {
        setSaving(false);
        setError(`Product saved, but the item code wasn't: ${codeErr.message} (run supabase/schema.sql again).`);
        return;
      }
    }
    setSaving(false);
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
        <h2 className="font-display text-2xl font-bold">{isNew ? "Add product" : "Edit product"}</h2>
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
              {isVideo(src) ? (
                <>
                  <video src={`${src}#t=0.5`} muted playsInline preload="metadata" className="size-full object-cover" />
                  <span className="pointer-events-none absolute end-1 top-1 rounded-full bg-navy/80 px-1.5 text-[10px] font-extrabold text-white">▶ Video</span>
                </>
              ) : (
                <Image src={src} alt="" fill unoptimized sizes="96px" className="object-cover" />
              )}
              {i === 0 && <span className="absolute start-1 top-1 rounded-full bg-navy px-2 text-[10px] font-extrabold text-white">Main</span>}
              <div className="absolute inset-x-1 bottom-1 flex justify-between">
                <span className="flex gap-1">
                  {i > 0 && (
                    <button type="button" onClick={() => moveImage(i, 0)} className="cursor-pointer rounded-full bg-white/90 px-2 text-[10px] font-extrabold">
                      Main
                    </button>
                  )}
                  {!isVideo(src) && (
                    <button
                      type="button"
                      onClick={() => setCropQueue((q) => [...q, { src, replaceIndex: i }])}
                      className="cursor-pointer rounded-full bg-white/90 px-2 text-[10px] font-extrabold"
                    >
                      Crop
                    </button>
                  )}
                </span>
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
            {uploading > 0 ? `Uploading ${uploading}…` : "Add photos / videos"}
            <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(e) => { queueFiles(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
        <span className="text-xs text-muted">The first photo is the main one shown in the shop. Each new photo opens the cropper; tap “Crop” to adjust a photo later. Videos (MP4, up to 50 MB) play on the product page; shop cards always show a photo.</span>
        {cropping && <ImageCropper key={cropping.src} src={cropping.src} onDone={(b) => void finishCrop(b)} onCancel={nextCrop} />}
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
          <select
            className={input}
            value={row.category}
            onChange={(e) => setRow((r) => ({ ...r, category: e.target.value, subcategory: "" }))}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name.en}
              </option>
            ))}
          </select>
        </Field>
        {(getCategory(row.category)?.subs.length ?? 0) > 0 && (
          <Field label="Subcategory">
            <select className={input} value={row.subcategory ?? ""} onChange={(e) => set("subcategory", e.target.value)}>
              <option value="">— Choose —</option>
              {getCategory(row.category)!.subs.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name.en}
                </option>
              ))}
            </select>
          </Field>
        )}

        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="mb-1.5 text-sm font-bold">Also show in (optional)</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map((n) => {
              const extras = row.extra_categories ?? [];
              return (
                <select
                  key={n}
                  aria-label={`Extra category ${n + 1}`}
                  className={input}
                  value={extras[n] ?? ""}
                  onChange={(e) => {
                    const next = [...extras];
                    next[n] = e.target.value;
                    set("extra_categories", next.filter(Boolean));
                  }}
                  disabled={n === 1 && !extras[0]}
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <optgroup key={c.slug} label={c.name.en}>
                      <option value={c.slug}>{c.subs.length ? `${c.name.en} (whole category)` : c.name.en}</option>
                      {c.subs.map((s) => (
                        <option key={s.slug} value={`${c.slug}/${s.slug}`}>
                          {c.name.en} → {s.name.en}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              );
            })}
          </div>
          <span className="text-xs text-muted">The same product also appears in up to 2 more categories / subcategories (3 in total).</span>
        </fieldset>

        <Field label="Item code (private)" hint="Only you see it: in the dashboard, on orders and in the WhatsApp order message. Customers never see it on the site.">
          <input className={input} dir="ltr" maxLength={40} value={row.code ?? ""} onChange={(e) => set("code", e.target.value)} placeholder="e.g. TNT-014" />
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
                {a.label} {a.sub.en}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">For boys or girls</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["boy", "👦 Boy"],
              ["girl", "👧 Girl"],
            ] as const
          ).map(([g, label]) => {
            const on = (row.genders ?? []).includes(g);
            return (
              <label key={g} className={`flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-bold ${on ? "bg-navy text-white" : "bg-surface"}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => set("genders", on ? (row.genders ?? []).filter((x) => x !== g) : [...(row.genders ?? []), g])}
                />
                {label}
              </label>
            );
          })}
        </div>
        <span className="text-xs text-muted">Tick both (or neither) if it suits boys and girls.</span>
      </fieldset>

      <section className={`flex flex-col gap-3 rounded-2xl border-2 p-4 ${row.gift_wrap ? "border-accent/40 bg-accent/5" : "border-dashed border-line"}`}>
        <label className="flex min-h-10 cursor-pointer items-center gap-2.5 font-extrabold">
          <input
            type="checkbox"
            className="size-5 accent-navy"
            checked={Boolean(row.gift_wrap)}
            onChange={(e) => set("gift_wrap", e.target.checked)}
          />
          <span aria-hidden>🎁</span> Offer gift wrapping for this product
        </label>
        {row.gift_wrap && (
          <Field label="Gift wrap price per item (USD)" hint="0 = FREE, or $0.25 steps up to $10. Customers switch it on per item; it's added to the total and the WhatsApp message.">
            <input
              className={`${input} w-36`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              max="10"
              dir="ltr"
              value={row.gift_wrap_price ?? 0}
              onChange={(e) => set("gift_wrap_price", e.target.value)}
            />
          </Field>
        )}
      </section>

      <Field label="Brand" hint="Optional. Shown on the product page only when filled.">
        <input className={input} value={row.brand ?? ""} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Chicco" />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">Available colors</legend>
        <div className="flex flex-wrap gap-2">
          {[
            ...colorPalette,
            // Colours added by hand, on this product or on any other one (so they can be reused).
            ...[...new Set([...(row.colors ?? []), ...allProducts.flatMap((p) => p.colors ?? [])])]
              .filter((slug) => slug.startsWith("#"))
              .map((slug) => getColor(slug)!),
          ].map((c) => {
            const on = (row.colors ?? []).includes(c.slug);
            return (
              <label
                key={c.slug}
                className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border-2 ps-1.5 pe-3 text-sm font-bold ${on ? "border-navy bg-surface" : "border-line bg-white"}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => set("colors", on ? (row.colors ?? []).filter((x) => x !== c.slug) : [...(row.colors ?? []), c.slug])}
                />
                <span className="size-6 rounded-full ring-1 ring-black/15" style={{ background: c.hex }} aria-hidden />
                {c.name.en}
                {on && <span aria-hidden>✓</span>}
              </label>
            );
          })}
        </div>
        <span className="text-xs text-muted">
          Tap the colors this product comes in — the customer must pick one before adding to cart. Leave all empty to hide colors.
        </span>
        <CustomColorAdder onAdd={(slug) => !(row.colors ?? []).includes(slug) && set("colors", [...(row.colors ?? []), slug])} />
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
            ["limited_quantity", "Limited quantity"],
            ["last_piece", "Last piece"],
            ["on_offer", "Offer"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex min-h-10 cursor-pointer items-center gap-2 font-bold">
            <input type="checkbox" className="size-5 accent-navy" checked={Boolean(row[key])} onChange={(e) => set(key, e.target.checked)} />
            {label}
          </label>
        ))}
      </fieldset>

      <RelatedPicker value={row.related ?? []} onChange={(ids) => set("related", ids)} products={allProducts} selfId={row.id} />

      <Field label="Position in shop" hint="Lower numbers are shown first. Leave 0 if the order doesn't matter (newest products then come first).">
        <input
          className={`${input} w-28`}
          type="number"
          dir="ltr"
          value={row.sort}
          onChange={(e) => set("sort", Number(e.target.value))}
        />
      </Field>

      <details className="rounded-xl bg-surface px-4 py-3">
        <summary className="cursor-pointer text-sm font-bold text-muted">Advanced: page link</summary>
        <div className="mt-3">
          <Field
            label="Link name (slug)"
            hint={`Filled in automatically from the English name. Page address: /product?slug=${slugify(row.slug || row.name_en) || "…"}. Avoid changing it once the product link has been shared.`}
          >
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
        </div>
      </details>

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
