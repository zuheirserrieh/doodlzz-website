"use client";

import { useEffect, useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { getSupabase } from "@/lib/supabase";

/** /admin → Settings: shop-wide options (gift wrap for now). */
export function AdminSettings() {
  const { giftWrap, reload } = useCatalog();
  const [enabled, setEnabled] = useState(giftWrap.enabled);
  const [price, setPrice] = useState(String(giftWrap.price));
  const [status, setStatus] = useState<"" | "saving" | "saved">("");
  const [error, setError] = useState("");

  // Show the saved values once they've loaded.
  useEffect(() => {
    setEnabled(giftWrap.enabled); // eslint-disable-line react-hooks/set-state-in-effect
    setPrice(String(giftWrap.price));
  }, [giftWrap.enabled, giftWrap.price]);

  async function save() {
    const supabase = getSupabase();
    if (!supabase) return;
    const value = { enabled, price: Math.max(0, Number(price) || 0) };
    setStatus("saving");
    setError("");
    const { error: err } = await supabase
      .from("site_settings")
      .upsert({ key: "gift_wrap", value, updated_at: new Date().toISOString() });
    if (err) {
      setError(
        err.code === "PGRST205" ? "The settings table is missing. Run supabase/schema.sql in the Supabase SQL Editor first." : err.message,
      );
      setStatus("");
      return;
    }
    await reload();
    setStatus("saved");
    setTimeout(() => setStatus(""), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-lg font-extrabold">🎁 Gift wrap</h3>
          <p className="text-sm text-muted">
            Customers can tick “Gift wrap” in the cart and at checkout. It appears on the order and in the WhatsApp message.
          </p>
        </div>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 font-bold">
          <input type="checkbox" className="size-5 accent-navy" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Offer gift wrapping
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold">Price (USD)</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            dir="ltr"
            value={price}
            disabled={!enabled}
            onChange={(e) => setPrice(e.target.value)}
            className="h-11 w-40 rounded-xl border border-[#dfe3ea] bg-white px-3 font-semibold outline-none focus:border-navy disabled:opacity-50"
          />
          <span className="text-xs text-muted">0 = shown as FREE. Any other amount is added to the order total.</span>
        </label>
        {error && <p className="rounded-xl bg-pastel-peach p-3 text-sm font-bold text-accent-dark">{error}</p>}
        <button
          type="button"
          onClick={save}
          disabled={status === "saving"}
          className="h-11 w-fit cursor-pointer rounded-full bg-accent px-6 text-sm font-extrabold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save"}
        </button>
      </section>
    </div>
  );
}
