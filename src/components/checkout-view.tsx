"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useCartLines } from "@/components/cart-view";
import { useAuth } from "@/components/catalog-provider";
import { WhatsAppIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-card";
import { useDict, usePrice, useStore } from "@/components/store-provider";
import { getSupabase } from "@/lib/supabase";
import { whatsappLink } from "@/lib/site";

type Payment = "cash" | "whish";
type Customer = { name: string; phone: string; city: string; address: string; notes: string; payment: Payment };

const DETAILS_KEY = "dz-customer";
const empty: Customer = { name: "", phone: "", city: "", address: "", notes: "", payment: "cash" };

const input =
  "h-12 w-full rounded-xl border border-[#dfe3ea] bg-white px-3.5 text-[15px] font-semibold outline-none focus:border-navy focus:ring-2 focus:ring-navy/15";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function CheckoutView() {
  const { locale, clearCart } = useStore();
  const t = useDict();
  const price = usePrice();
  const { lines, subtotal, ready } = useCartLines();
  const [form, setForm] = useState<Customer>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: number | null; link: string } | null>(null);
  const { session } = useAuth();

  // Prefill with the details used last time on this device.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DETAILS_KEY);
      if (saved) setForm({ ...empty, ...JSON.parse(saved), notes: "" }); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      // ignore
    }
  }, []);

  // Signed-in customers: fill name and phone from their account if still empty.
  useEffect(() => {
    const meta = session?.user.user_metadata as { full_name?: string; phone?: string } | undefined;
    if (!meta) return;
    setForm((f) => ({ ...f, name: f.name || meta.full_name || "", phone: f.phone || meta.phone || "" })); // eslint-disable-line react-hooks/set-state-in-effect
  }, [session]);

  const set = <K extends keyof Customer>(key: K, value: Customer[K]) => setForm((f) => ({ ...f, [key]: value }));

  function buildMessage(orderId: number | null, total: number) {
    const paymentLabel = form.payment === "cash" ? t.checkout.cash : t.checkout.whish;
    return [
      `🛒 ${t.checkout.msgTitle(orderId)}`,
      "",
      `${t.checkout.msgItems}:`,
      ...lines.map((l) => `• ${l.qty} × ${l.product.name[locale]} — ${price(l.product.priceUsd * l.qty)}`),
      `${t.checkout.total}: ${price(total)} ${t.checkout.msgDeliveryNote}`,
      "",
      `${t.checkout.name}: ${form.name.trim()}`,
      `${t.checkout.phone}: ${form.phone.trim()}`,
      `${t.checkout.city}: ${form.city.trim()}`,
      `${t.checkout.address.split(" (")[0]}: ${form.address.trim()}`,
      ...(form.notes.trim() ? [`${t.checkout.notes.split(" (")[0]}: ${form.notes.trim()}`] : []),
      `${t.checkout.payment}: ${paymentLabel}`,
    ].join("\n");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    let orderId: number | null = null;
    let total = subtotal;
    const supabase = getSupabase();
    if (supabase) {
      // Saved in the database first so the manager also sees it in the admin panel.
      const { data, error: rpcError } = await supabase.rpc("place_order", {
        customer: { ...form },
        cart: lines.map((l) => ({ id: l.product.id, qty: l.qty })),
        order_locale: locale,
      });
      const row = Array.isArray(data) ? data[0] : null;
      if (rpcError || !row) {
        console.error("place_order failed", rpcError);
        setError(t.checkout.error);
        setBusy(false);
        return;
      }
      orderId = Number(row.order_id);
      total = Number(row.total);
    }

    const link = whatsappLink(buildMessage(orderId, total));
    try {
      localStorage.setItem(DETAILS_KEY, JSON.stringify({ ...form, notes: "" }));
    } catch {
      // ignore
    }
    clearCart();
    setDone({ id: orderId, link });
    setBusy(false);
    window.location.href = link;
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-pastel-mint text-3xl" aria-hidden>
          ✓
        </div>
        <h1 className="font-display text-[28px] leading-tight font-semibold">
          {done.id ? t.checkout.successTitle(done.id) : t.checkout.msgTitle(null)}
        </h1>
        <p className="text-ink-soft">{t.checkout.successText}</p>
        <a
          href={done.link}
          className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-whatsapp text-[15px] font-extrabold text-white hover:text-white hover:brightness-110"
        >
          <WhatsAppIcon />
          {t.checkout.openWhatsApp}
        </a>
        <Link href={`/${locale}`} className="text-sm font-bold text-accent">
          {t.checkout.backHome}
        </Link>
      </div>
    );
  }

  if (!ready) return <div className="min-h-[50vh]" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">{t.cart.title}</h1>
        <p className="text-muted">{t.cart.empty}</p>
        <Link href={`/${locale}/shop`} className="flex h-12 items-center rounded-full bg-accent px-6 font-extrabold text-white hover:text-white">
          {t.cart.keepShopping}
        </Link>
      </div>
    );
  }

  const paymentOptions: { value: Payment; label: string; hint: string }[] = [
    { value: "cash", label: t.checkout.cash, hint: t.checkout.cashHint },
    { value: "whish", label: t.checkout.whish, hint: t.checkout.whishHint },
  ];

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-8 px-4 pt-6 md:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-7">
        <h1 className="font-display text-[28px] font-semibold">{t.checkout.title}</h1>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 text-lg font-extrabold">{t.checkout.delivery}</legend>
          <Field label={t.checkout.name}>
            <input className={input} required autoComplete="name" maxLength={120} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label={t.checkout.phone} hint={t.checkout.phoneHint}>
            <input
              className={input}
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="+961 70 123 456"
              pattern="[+0-9 ()\-]{7,20}"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label={t.checkout.city}>
            <input className={input} required autoComplete="address-level2" maxLength={80} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label={t.checkout.address}>
            <textarea
              className={`${input} h-24 py-3`}
              required
              autoComplete="street-address"
              maxLength={400}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
          <Field label={t.checkout.notes}>
            <textarea className={`${input} h-20 py-3`} maxLength={600} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-lg font-extrabold">{t.checkout.payment}</legend>
          {paymentOptions.map((o) => (
            <label
              key={o.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 ${
                form.payment === o.value ? "border-navy bg-surface" : "border-[#dfe3ea]"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={o.value}
                checked={form.payment === o.value}
                onChange={() => set("payment", o.value)}
                className="size-5 accent-navy"
              />
              <span className="flex flex-col">
                <span className="font-extrabold">{o.label}</span>
                <span className="text-sm text-muted">{o.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <aside className="flex h-fit flex-col gap-4 rounded-3xl bg-surface p-5 md:sticky md:top-28">
        <h2 className="text-lg font-extrabold">{t.checkout.summary}</h2>
        <ul className="flex flex-col gap-3">
          {lines.map(({ product, qty }) => (
            <li key={product.id} className="flex items-center gap-3">
              <ProductImage product={product} iconSize={28} className="size-14 flex-none rounded-xl" />
              <span className="min-w-0 flex-1 text-sm font-bold leading-snug">
                {qty} × {product.name[locale]}
              </span>
              <span className="text-sm font-extrabold">{price(product.priceUsd * qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-[#dfe3ea] pt-3 text-lg font-extrabold">
          <span>{t.checkout.total}</span>
          <span>{price(subtotal)}</span>
        </div>
        <p className="text-sm text-muted">{t.checkout.deliveryFee}</p>
        {error && (
          <p role="alert" className="rounded-xl bg-pastel-peach p-3 text-sm font-bold text-accent-dark">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-whatsapp text-base font-extrabold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          <WhatsAppIcon />
          {busy ? t.checkout.placing : t.checkout.buy}
        </button>
        <p className="text-center text-xs text-muted">{t.checkout.buyHint}</p>
      </aside>
    </form>
  );
}
