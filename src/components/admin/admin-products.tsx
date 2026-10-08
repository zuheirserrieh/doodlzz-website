"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ProductForm, emptyRow } from "@/components/admin/product-form";
import { useCatalog } from "@/components/catalog-provider";
import { formatPrice } from "@/components/store-provider";
import { categories, getCategory } from "@/data/catalog";
import { inCategory, sampleProducts, type ProductRow } from "@/data/products";
import { photosOf } from "@/lib/media";
import { getSupabase } from "@/lib/supabase";

export function AdminProducts() {
  const { reload: reloadShop } = useCatalog();
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [query, setQuery] = useState("");
  // "" = all; "cat" = a category; "cat/sub" = one subcategory.
  const [scope, setScope] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const [{ data, error: err }, { data: codeRows }] = await Promise.all([
      supabase.from("products").select("*").order("sort", { ascending: true }).order("created_at", { ascending: false }),
      // Missing until schema.sql is re-run; products still load without codes.
      supabase.from("product_codes").select("product_id, code"),
    ]);
    if (err) {
      setError(err.message);
      return;
    }
    const codes = new Map((codeRows ?? []).map((c: { product_id: string; code: string }) => [c.product_id, c.code]));
    setRows((data as ProductRow[]).map((r) => ({ ...r, code: codes.get(r.id) ?? "" })));
  }, []);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  async function afterChange() {
    setEditing(null);
    await load();
    await reloadShop(); // keep the shop's cached catalogue in sync
  }

  async function toggleActive(row: ProductRow) {
    const supabase = getSupabase();
    if (!supabase) return;
    setRows((list) => list?.map((r) => (r.id === row.id ? { ...r, active: !r.active } : r)) ?? null);
    const { error: err } = await supabase.from("products").update({ active: !row.active }).eq("id", row.id);
    if (err) setError(err.message);
    await reloadShop();
  }

  async function importSamples() {
    const supabase = getSupabase();
    if (!supabase || !confirm("Add the 12 sample products? You can edit or delete them afterwards.")) return;
    setImporting(true);
    const { error: err } = await supabase.from("products").insert(
      sampleProducts.map((p, i) => ({
        slug: p.slug,
        name_en: p.name.en,
        name_ar: p.name.ar,
        description_en: p.description.en,
        description_ar: p.description.ar,
        category: p.category,
        subcategory: p.subcategory ?? "",
        ages: p.ages,
        price_usd: p.priceUsd,
        best_seller: Boolean(p.bestSeller),
        is_new: Boolean(p.isNew),
        sort: i,
      })),
    );
    setImporting(false);
    if (err) setError(err.message);
    await afterChange();
  }

  if (editing) {
    return <ProductForm initial={editing} allProducts={rows ?? []} onDone={afterChange} onCancel={() => setEditing(null)} />;
  }

  if (rows === null) return error ? <p className="text-accent-dark">{error}</p> : <div className="h-40 animate-pulse rounded-2xl bg-white" />;

  const q = query.trim().toLowerCase();
  const [scopeCat, scopeSub] = scope.split("/");
  const visible = rows
    .filter((r) => !scopeCat || inCategory(r, scopeCat, scopeSub))
    .filter((r) => !q || `${r.name_en} ${r.name_ar} ${r.brand ?? ""} ${r.code ?? ""}`.toLowerCase().includes(q));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditing({ ...emptyRow })}
          className="h-11 cursor-pointer rounded-full bg-accent px-5 text-sm font-extrabold text-white hover:bg-accent-dark"
        >
          + Add product
        </button>
        <input
          type="search"
          placeholder="Search name, brand or code…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 min-w-0 flex-1 rounded-full border border-[#dfe3ea] bg-white px-4 text-sm font-semibold outline-none focus:border-navy"
        />
        <select
          aria-label="Category"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="h-11 w-full cursor-pointer rounded-full border border-[#dfe3ea] bg-white px-4 text-sm font-bold outline-none focus:border-navy sm:w-auto"
        >
          <option value="">All categories ({rows.length})</option>
          {categories.map((c) => (
            <optgroup key={c.slug} label={c.name.en}>
              <option value={c.slug}>
                All {c.name.en} ({rows.filter((r) => inCategory(r, c.slug)).length})
              </option>
              {c.subs.map((sub) => (
                <option key={sub.slug} value={`${c.slug}/${sub.slug}`}>
                  {sub.name.en} ({rows.filter((r) => inCategory(r, c.slug, sub.slug)).length})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {error && <p className="font-bold text-accent-dark">{error}</p>}

      {rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center">
          <p className="text-ink-soft">No products yet. Add your first product, or start from the sample catalogue.</p>
          <button
            type="button"
            disabled={importing}
            onClick={importSamples}
            className="h-11 cursor-pointer rounded-full border-2 border-navy px-5 text-sm font-extrabold disabled:opacity-60"
          >
            {importing ? "Importing…" : "Import 12 sample products"}
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {visible.map((r) => (
          <li key={r.id} className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ${r.active ? "" : "opacity-60"}`}>
            <div className={`relative size-16 flex-none overflow-hidden rounded-xl ${getCategory(r.category)?.tint ?? "bg-surface"}`}>
              {photosOf(r.images)[0] && <Image src={photosOf(r.images)[0]} alt="" fill unoptimized sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold">
                {r.code && <span className="me-1.5 rounded-md bg-navy px-1.5 py-0.5 text-xs text-white">{r.code}</span>}
                {r.name_en}
              </p>
              <p className="truncate text-xs text-muted">
                {getCategory(r.category)?.name.en ?? r.category}
                {r.best_seller && " · Best seller"}
                {r.is_new && " · New"}
                {!r.active && " · Hidden"}
              </p>
              <p className="text-sm font-extrabold">
                {formatPrice(Number(r.price_usd))}
                {r.compare_at_usd != null && <s className="ms-2 text-xs font-bold text-muted">{formatPrice(Number(r.compare_at_usd))}</s>}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleActive(r)}
              className="hidden h-9 cursor-pointer rounded-full bg-surface px-3 text-xs font-extrabold sm:block"
            >
              {r.active ? "Hide" : "Show"}
            </button>
            <button type="button" onClick={() => setEditing(r)} className="h-9 cursor-pointer rounded-full bg-navy px-4 text-xs font-extrabold text-white">
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
