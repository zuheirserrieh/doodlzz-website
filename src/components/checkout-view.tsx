"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useCartLines } from "@/components/cart-view";
import { useAuth } from "@/components/catalog-provider";
import { TruckIcon, WhatsAppIcon } from "@/components/icons";
import { ProductImage, productHref } from "@/components/product-card";
import { useDict, usePrice, useStore } from "@/components/store-provider";
import { WhishLogo } from "@/components/whish-logo";
import { getSupabase } from "@/lib/supabase";
import { whatsappLink } from "@/lib/site";

type Payment = "cash" | "whish";
type DeliveryOption = "standard" | "express" | "sameday";
type Customer = { name: string; phone: string; city: string; address: string; notes: string; delivery: DeliveryOption };

const DETAILS_KEY = "dz-customer";
const empty: Customer = { name: "", phone: "", city: "", address: "", notes: "", delivery: "standard" };
const deliveryOptions: DeliveryOption[] = ["standard", "express", "sameday"];

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
  const { locale, clearCart, orderNote, setOrderNote } = useStore();
  const t = useDict();
  const price = usePrice();
  const { lines, subtotal, ready } = useCartLines();
  const { session } = useAuth();
  const [form, setForm] = useState<Customer>(empty);
  const [busy, setBusy] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: number | null; link: string } | null>(null);

  // Prefill with the details used last time on this device, plus the note typed in the cart.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DETAILS_KEY);
      if (saved) setForm((f) => ({ ...f, ...JSON.parse(saved), notes: f.notes })); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (orderNote) setForm((f) => (f.notes ? f : { ...f, notes: orderNote })); // eslint-disable-line react-hooks/set-state-in-effect
  }, [orderNote]);

  // Signed-in customers: fill name and phone from their account if still empty.
  useEffect(() => {
    const meta = session?.user.user_metadata as { full_name?: string; phone?: string } | undefined;
    if (!meta) return;
    setForm((f) => ({ ...f, name: f.name || meta.full_name || "", phone: f.phone || meta.phone || "" })); // eslint-disable-line react-hooks/set-state-in-effect
  }, [session]);

  const set = <K extends keyof Customer>(key: K, value: Customer[K]) => setForm((f) => ({ ...f, [key]: value }));

  function buildMessage(orderId: number | null, total: number, payment: Payment) {
    const delivery = t.checkout.deliveryOptions[form.delivery];
    return [
      `🛒 ${t.checkout.msgTitle(orderId)}`,
      "",
      `${t.checkout.msgItems}:`,
      // WhatsApp turns the address under each item into a tappable link to the product.
      ...lines.flatMap((l) => [
        `• ${l.qty} × ${l.product.name[locale]} — ${price(l.product.priceUsd * l.qty)}`,
        `  ${window.location.origin}${productHref(locale, l.product.slug)}`,
      ]),
      `${t.checkout.total}: ${price(total)} ${t.checkout.msgDeliveryNote}`,
      "",
      `🚚 ${t.checkout.msgDelivery}: ${delivery.label} (${delivery.time})`,
      `${payment === "cash" ? "💵" : "📱"} ${t.checkout.payment}: ${payment === "cash" ? t.checkout.cash : t.checkout.whish}`,
      "",
      `${t.checkout.name}: ${form.name.trim()}`,
      `${t.checkout.phone}: ${form.phone.trim()}`,
      `${t.checkout.city}: ${form.city.trim()}`,
      `${t.checkout.address.split(" (")[0]}: ${form.address.trim()}`,
      ...(form.notes.trim() ? [`${t.checkout.notes.split(" (")[0]}: ${form.notes.trim()}`] : []),
    ].join("\n");
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    // Which of the two pay buttons was pressed.
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const payment: Payment = submitter?.value === "whish" ? "whish" : "cash";
    setBusy(payment);
    setError("");

    let orderId: number | null = null;
    let total = subtotal;
    const supabase = getSupabase();
    if (supabase) {
      // Saved in the database first so the manager also sees it in the admin panel.
      const { data, error: rpcError } = await supabase.rpc("place_order", {
        customer: { ...form, payment },
        cart: lines.map((l) => ({ id: l.product.id, qty: l.qty })),
        order_locale: locale,
      });
      const row = Array.isArray(data) ? data[0] : null;
      if (rpcError || !row) {
        console.error("place_order failed", rpcError);
        setError(t.checkout.error);
        setBusy(null);
        return;
      }
      orderId = Number(row.order_id);
      total = Number(row.total);
    }

    const link = whatsappLink(buildMessage(orderId, total, payment));
    try {
      localStorage.setItem(DETAILS_KEY, JSON.stringify({ ...form, notes: "" }));
    } catch {
      // ignore
    }
    clearCart();
    setOrderNote("");
    setDone({ id: orderId, link });
    setBusy(null);
    window.location.href = link;
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-pastel-mint text-3xl" aria-hidden>
          ✓
        </div>
        <h1 className="font-display text-[28px] leading-tight font-bold">
          {done.id ? t.checkout.successTitle(done.id) : t.checkout.msgTitle(null)}
        </h1>
        <p className="text-ink-soft">{t.checkout.successText}</p>
        <a
          href={done.link}
          className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] text-[15px] font-extrabold text-white hover:text-white hover:brightness-105"
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
        <h1 className="font-display text-3xl font-bold">{t.cart.title}</h1>
        <p className="text-muted">{t.cart.empty}</p>
        <Link href={`/${locale}/shop`} className="flex h-12 items-center rounded-full bg-accent px-6 font-extrabold text-white hover:text-white">
          {t.cart.keepShopping}
        </Link>
      </div>
    );
  }

  const payButton =
    "flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-2xl px-4 text-base font-extrabold disabled:cursor-wait disabled:opacity-70";

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 pt-6 md:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-7">
        <h1 className="font-display text-[28px] font-bold">{t.checkout.title}</h1>

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
          <legend className="mb-3 flex items-center gap-2 text-lg font-extrabold">
            <TruckIcon /> {t.checkout.deliveryTitle}
          </legend>
          {deliveryOptions.map((key) => {
            const o = t.checkout.deliveryOptions[key];
            const on = form.delivery === key;
            return (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 ${on ? "border-navy bg-surface" : "border-[#dfe3ea]"}`}
              >
                <input type="radio" name="delivery" checked={on} onChange={() => set("delivery", key)} className="size-5 accent-navy" />
                <span className="flex flex-col">
                  <span className="font-extrabold">
                    {o.label} · {o.time}
                  </span>
                  <span className="text-sm text-muted">{o.fee}</span>
                </span>
              </label>
            );
          })}
          <p className="text-sm text-ink-soft">{t.checkout.finalizedNote}</p>
          <p className="rounded-2xl bg-pastel-yellow p-3.5 text-sm font-bold">🛠️ {t.checkout.installNote}</p>
        </fieldset>
      </div>

      <aside className="flex h-fit flex-col gap-4 rounded-3xl bg-surface p-5 md:sticky md:top-28">
        <h2 className="text-lg font-extrabold">{t.checkout.summary}</h2>
        <ul className="flex flex-col gap-3">
          {lines.map(({ product, qty }) => (
            <li key={product.id} className="flex items-center gap-3">
              <ProductImage product={product} iconSize={28} className="size-14 flex-none rounded-xl" />
              <span className="min-w-0 flex-1 text-sm leading-snug font-bold">
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
        <p className="rounded-xl bg-white p-3 text-sm font-bold">{t.checkout.confirmNote}</p>
        {error && (
          <p role="alert" className="rounded-xl bg-pastel-peach p-3 text-sm font-bold text-accent-dark">
            {error}
          </p>
        )}
        <p className="text-sm font-extrabold">{t.checkout.payWith}:</p>
        <button type="submit" name="payment" value="cash" disabled={busy !== null} className={`${payButton} bg-accent text-white hover:bg-accent-dark`}>
          <span aria-hidden>💵</span>
          {busy === "cash" ? t.checkout.placing : t.checkout.payCash}
        </button>
        <button
          type="submit"
          name="payment"
          value="whish"
          disabled={busy !== null}
          className={`${payButton} border-2 border-[#E8204A] bg-white text-[#E8204A]`}
        >
          <WhishLogo className="h-6" />
          {busy === "whish" ? t.checkout.placing : t.checkout.payWhish}
        </button>
      </aside>
    </form>
  );
}
