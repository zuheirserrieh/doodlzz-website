"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ImageCropper } from "@/components/admin/image-cropper";
import { shrinkImage } from "@/components/admin/product-form";
import { useCatalog, type HomeMedia } from "@/components/catalog-provider";
import { categories } from "@/data/catalog";
import { PRODUCT_IMAGES_BUCKET, getSupabase } from "@/lib/supabase";

type Section = HomeMedia["section"];

const sections: { id: Section; title: string; help: string; aspect: number }[] = [
  {
    id: "hero",
    title: "Slideshow (top of the home page)",
    help: "Wide photos work best; the middle of the photo is what shows on phones. Title and text are optional (leave empty for a photo-only banner).",
    aspect: 4 / 3,
  },
  {
    id: "moment",
    title: "Real Moments (customer photos & reviews)",
    help: "A customer photo with one line from their review. Tall photos look best.",
    aspect: 3 / 4,
  },
  {
    id: "brand",
    title: "Brands we carry (logos)",
    help: "Brand logos for the scrolling strip. Use “Fit whole photo” so the logo isn't cut.",
    aspect: 2,
  },
  {
    id: "social",
    title: "Join Doodlzz Family (photo grid)",
    help: "Up to 9 square photos, e.g. from your Instagram. Optional link: the post's address.",
    aspect: 1,
  },
];

// Where a slide's "Shop now" button can go (category pages, or all products).
const HERO_LINKS = [
  { value: "", label: "All products" },
  ...categories.map((c) => ({ value: `/category/${c.slug}`, label: c.name.en })),
];

const input =
  "h-10 w-full rounded-lg border border-[#dfe3ea] bg-white px-2.5 text-sm font-semibold outline-none focus:border-navy";

function MediaRow({
  item,
  first,
  last,
  onChange,
  onMove,
  onDelete,
}: {
  item: HomeMedia;
  first: boolean;
  last: boolean;
  onChange: (patch: Partial<HomeMedia>) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  // Text is edited locally and saved when the field loses focus.
  const [title, setTitle] = useState(item.title);
  const [subtitle, setSubtitle] = useState(item.subtitle);
  const [link, setLink] = useState(item.link);
  const [titleAr, setTitleAr] = useState(item.title_ar ?? "");
  const [subtitleAr, setSubtitleAr] = useState(item.subtitle_ar ?? "");
  const small = "flex size-9 flex-none cursor-pointer items-center justify-center rounded-full bg-surface text-sm font-extrabold disabled:opacity-30";

  return (
    <li className={`flex gap-3 rounded-2xl bg-white p-3 shadow-sm ${item.active ? "" : "opacity-60"}`}>
      <div
        className={`relative flex-none overflow-hidden rounded-xl bg-surface ${
          item.section === "moment" ? "h-24 w-[72px]" : item.section === "brand" ? "h-12 w-24" : item.section === "hero" ? "h-20 w-28" : "size-20"
        }`}
      >
        <Image src={item.image} alt="" fill unoptimized sizes="96px" className={item.section === "brand" ? "object-contain p-1" : "object-cover"} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {item.section === "hero" && (
          <>
            <input
              className={input}
              placeholder="Title (English), e.g. Summer is here!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title !== item.title && onChange({ title })}
            />
            <input
              className={input}
              dir="rtl"
              placeholder="العنوان بالعربية"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              onBlur={() => titleAr !== (item.title_ar ?? "") && onChange({ title_ar: titleAr })}
            />
            <input
              className={input}
              placeholder="Short sentence (English)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              onBlur={() => subtitle !== item.subtitle && onChange({ subtitle })}
            />
            <input
              className={input}
              dir="rtl"
              placeholder="جملة قصيرة بالعربية"
              value={subtitleAr}
              onChange={(e) => setSubtitleAr(e.target.value)}
              onBlur={() => subtitleAr !== (item.subtitle_ar ?? "") && onChange({ subtitle_ar: subtitleAr })}
            />
            <select
              className={input}
              value={HERO_LINKS.some((l) => l.value === link) ? link : "custom"}
              onChange={(e) => {
                if (e.target.value === "custom") return;
                setLink(e.target.value);
                onChange({ link: e.target.value });
              }}
            >
              {HERO_LINKS.map((l) => (
                <option key={l.value} value={l.value}>
                  “Shop now” goes to: {l.label}
                </option>
              ))}
              <option value="custom">Other link (type below)</option>
            </select>
            {!HERO_LINKS.some((l) => l.value === link) && (
              <input
                className={input}
                dir="ltr"
                placeholder="/category/sport  or  https://…"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onBlur={() => link !== item.link && onChange({ link: link.trim() })}
              />
            )}
          </>
        )}
        {item.section === "moment" && (
          <>
            <input
              className={input}
              dir="auto"
              placeholder="Review line, e.g. “Delivered next day, my son loves it!”"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title !== item.title && onChange({ title })}
            />
            <input
              className={input}
              dir="auto"
              placeholder="Customer name · Product"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              onBlur={() => subtitle !== item.subtitle && onChange({ subtitle })}
            />
            <label className="flex items-center gap-2 text-xs font-bold">
              Stars
              <select
                value={item.rating}
                onChange={(e) => onChange({ rating: Number(e.target.value) })}
                className="h-9 rounded-lg border border-[#dfe3ea] bg-white px-1.5 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        {item.section === "brand" && (
          <input
            className={input}
            placeholder="Brand name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== item.title && onChange({ title })}
          />
        )}
        {(item.section === "brand" || item.section === "social") && (
          <input
            className={input}
            dir="ltr"
            type="url"
            placeholder={item.section === "social" ? "Instagram post link (optional)" : "Brand website (optional)"}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onBlur={() => link !== item.link && onChange({ link: link.trim() })}
          />
        )}

        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <button type="button" aria-label="Move up" disabled={first} onClick={() => onMove(-1)} className={small}>
            ↑
          </button>
          <button type="button" aria-label="Move down" disabled={last} onClick={() => onMove(1)} className={small}>
            ↓
          </button>
          <button
            type="button"
            onClick={() => onChange({ active: !item.active })}
            className="h-9 cursor-pointer rounded-full bg-surface px-3 text-xs font-extrabold"
          >
            {item.active ? "Hide" : "Show"}
          </button>
          <button type="button" onClick={onDelete} className="h-9 cursor-pointer px-2 text-xs font-bold text-accent-dark underline">
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

/** /admin → Home page: Real Moments, brand logos and the social photo grid. */
export function AdminHomeMedia() {
  const { reload: reloadShop } = useCatalog();
  const [items, setItems] = useState<HomeMedia[] | null>(null);
  const [error, setError] = useState("");
  const [cropping, setCropping] = useState<{ section: Section; src: string; file: File } | null>(null);
  const [uploading, setUploading] = useState<Section | null>(null);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("home_media")
      .select("*")
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true });
    if (err) {
      setError(
        err.code === "PGRST205" || err.code === "42703"
          ? "The home page table is missing. Run supabase/schema.sql in the Supabase SQL Editor first."
          : err.message,
      );
      setItems([]);
      return;
    }
    setError("");
    setItems(data as HomeMedia[]);
  }, []);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  async function refresh() {
    await load();
    await reloadShop();
  }

  async function update(item: HomeMedia, patch: Partial<HomeMedia>) {
    const supabase = getSupabase();
    if (!supabase) return;
    setItems((list) => list?.map((m) => (m.id === item.id ? { ...m, ...patch } : m)) ?? null);
    const { error: err } = await supabase.from("home_media").update(patch).eq("id", item.id);
    if (err) setError(err.message);
    await reloadShop();
  }

  async function move(list: HomeMedia[], index: number, dir: -1 | 1) {
    const supabase = getSupabase();
    const other = list[index + dir];
    if (!supabase || !other) return;
    const reordered = [...list];
    [reordered[index], reordered[index + dir]] = [reordered[index + dir], reordered[index]];
    // Renumber the whole section so the order is always explicit.
    await Promise.all(reordered.map((m, i) => supabase.from("home_media").update({ sort: i }).eq("id", m.id)));
    await refresh();
  }

  async function remove(item: HomeMedia) {
    const supabase = getSupabase();
    if (!supabase || !confirm("Delete this photo from the home page?")) return;
    const { error: err } = await supabase.from("home_media").delete().eq("id", item.id);
    if (err) setError(err.message);
    const marker = `/object/public/${PRODUCT_IMAGES_BUCKET}/`;
    const at = item.image.indexOf(marker);
    if (at >= 0) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([decodeURIComponent(item.image.slice(at + marker.length))]);
    await refresh();
  }

  async function finishCrop(result: Blob | null) {
    const job = cropping;
    if (!job) return;
    setCropping(null);
    URL.revokeObjectURL(job.src);
    const supabase = getSupabase();
    if (!supabase) return;
    setUploading(job.section);
    const blob = result ?? (await shrinkImage(job.file));
    const ext = blob.type === "image/webp" ? "webp" : (job.file.name.split(".").pop() ?? "jpg");
    const path = `home/${job.section}-${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, blob, { contentType: blob.type || job.file.type, cacheControl: "31536000" });
    if (upErr) {
      setError(`Photo upload failed: ${upErr.message}`);
      setUploading(null);
      return;
    }
    const image = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
    const count = items?.filter((m) => m.section === job.section).length ?? 0;
    const { error: insErr } = await supabase.from("home_media").insert({ section: job.section, image, sort: count });
    if (insErr) setError(insErr.message);
    setUploading(null);
    await refresh();
  }

  if (items === null) return <div className="h-40 animate-pulse rounded-2xl bg-white" />;

  return (
    <div className="flex flex-col gap-7">
      <p className="text-sm text-muted">
        Until you add a photo, each section shows sample placeholders on the home page. Text is saved when you tap outside the field.
      </p>
      {error && <p className="rounded-xl bg-pastel-peach p-3 text-sm font-bold text-accent-dark">{error}</p>}

      {sections.map((sec) => {
        const list = items.filter((m) => m.section === sec.id);
        return (
          <section key={sec.id} className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="font-extrabold">{sec.title}</h3>
                <p className="text-xs text-muted">{sec.help}</p>
              </div>
              <label className="flex h-10 cursor-pointer items-center rounded-full bg-accent px-4 text-sm font-extrabold text-white">
                {uploading === sec.id ? "Uploading…" : "+ Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) setCropping({ section: sec.id, src: URL.createObjectURL(file), file });
                  }}
                />
              </label>
            </div>
            {list.length === 0 ? (
              <p className="rounded-2xl bg-white p-4 text-center text-sm text-muted">Nothing yet. The site shows sample placeholders here.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {list.map((m, i) => (
                  <MediaRow
                    key={m.id}
                    item={m}
                    first={i === 0}
                    last={i === list.length - 1}
                    onChange={(patch) => update(m, patch)}
                    onMove={(dir) => move(list, i, dir)}
                    onDelete={() => remove(m)}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {cropping && (
        <ImageCropper
          key={cropping.src}
          src={cropping.src}
          aspect={sections.find((s) => s.id === cropping.section)!.aspect}
          onDone={(b) => void finishCrop(b)}
          onCancel={() => {
            URL.revokeObjectURL(cropping.src);
            setCropping(null);
          }}
        />
      )}
    </div>
  );
}
