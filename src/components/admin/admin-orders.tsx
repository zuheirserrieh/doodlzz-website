"use client";

import { useCallback, useEffect, useState } from "react";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { formatPrice } from "@/components/store-provider";
import { getSupabase } from "@/lib/supabase";

type OrderItem = { id: string; name: string; qty: number; price: number };
type Order = {
  id: number;
  created_at: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  payment_method: "cash" | "whish";
  items: OrderItem[];
  total_usd: number;
  status: string;
};

const statuses = [
  { value: "new", label: "New", tint: "bg-badge" },
  { value: "confirmed", label: "Confirmed", tint: "bg-pastel-blue" },
  { value: "out_for_delivery", label: "Out for delivery", tint: "bg-pastel-lilac" },
  { value: "delivered", label: "Delivered", tint: "bg-pastel-mint" },
  { value: "cancelled", label: "Cancelled", tint: "bg-line" },
];

/** Turn what the customer typed (03 123 456, +961 3 123 456, 70123456…) into wa.me digits. */
function toWhatsAppNumber(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("961")) return digits;
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.length <= 8 ? `961${digits}` : digits;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState("active");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error: err } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(300);
    if (err) {
      setError(err.message);
      return;
    }
    setError("");
    setOrders(data as Order[]);
  }, []);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
    const id = setInterval(load, 60_000); // pick up new orders without reloading the page
    return () => clearInterval(id);
  }, [load]);

  async function setStatus(order: Order, status: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    setOrders((list) => list?.map((o) => (o.id === order.id ? { ...o, status } : o)) ?? null);
    const { error: err } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (err) {
      setError(err.message);
      void load();
    }
  }

  if (orders === null) return error ? <p className="text-accent-dark">{error}</p> : <div className="h-40 animate-pulse rounded-2xl bg-white" />;

  const count = (s: string) => orders.filter((o) => o.status === s).length;
  const visible = orders.filter((o) =>
    filter === "all" ? true : filter === "active" ? !["delivered", "cancelled"].includes(o.status) : o.status === filter,
  );
  const chip = (value: string, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      className={`h-9 flex-none cursor-pointer rounded-full px-3.5 text-sm font-bold ${filter === value ? "bg-navy text-white" : "bg-white"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
        {chip("active", `Open (${orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length})`)}
        {statuses.map((s) => chip(s.value, `${s.label} (${count(s.value)})`))}
        {chip("all", `All (${orders.length})`)}
        <button type="button" onClick={load} className="ms-auto h-9 flex-none cursor-pointer rounded-full bg-white px-3.5 text-sm font-bold">
          ↻ Refresh
        </button>
      </div>
      {error && <p className="font-bold text-accent-dark">{error}</p>}
      {visible.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-muted">No orders here.</p>}

      {visible.map((o) => {
        const status = statuses.find((s) => s.value === o.status);
        return (
          <article key={o.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold">#{o.id}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${status?.tint ?? "bg-line"}`}>{status?.label ?? o.status}</span>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-extrabold">
                {o.payment_method === "cash" ? "💵 Cash on delivery" : "📱 Whish Money"}
              </span>
              <span className="ms-auto text-xs text-muted">{dateFormat.format(new Date(o.created_at))}</span>
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="text-sm">
                <p className="font-extrabold">{o.customer_name}</p>
                <p dir="ltr" className="text-start">{o.phone}</p>
                <p className="mt-1">
                  <span className="font-bold">{o.city}</span> — {o.address}
                </p>
                {o.notes && <p className="mt-1 rounded-lg bg-pastel-yellow px-2 py-1">📝 {o.notes}</p>}
                <div className="mt-2 flex gap-2">
                  <a
                    href={`https://wa.me/${toWhatsAppNumber(o.phone)}?text=${encodeURIComponent(`Hi ${o.customer_name}, this is Doodlzz about your order #${o.id}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 items-center gap-1.5 rounded-full bg-whatsapp px-3 text-xs font-extrabold text-white hover:text-white"
                  >
                    <WhatsAppIcon size={16} /> WhatsApp
                  </a>
                  <a href={`tel:${o.phone.replace(/[^\d+]/g, "")}`} className="flex h-9 items-center gap-1.5 rounded-full bg-surface px-3 text-xs font-extrabold">
                    <PhoneIcon size={16} /> Call
                  </a>
                </div>
              </div>
              <div className="text-sm">
                <ul className="flex flex-col gap-1">
                  {o.items.map((i, n) => (
                    <li key={n} className="flex justify-between gap-2">
                      <span>
                        {i.qty} × {i.name}
                      </span>
                      <span className="font-bold">{formatPrice(Number(i.price) * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 flex justify-between border-t border-line pt-2 font-extrabold">
                  <span>Total (before delivery)</span>
                  <span>{formatPrice(Number(o.total_usd))}</span>
                </p>
              </div>
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm font-bold">
              Status
              <select
                value={o.status}
                onChange={(e) => setStatus(o, e.target.value)}
                className="h-10 cursor-pointer rounded-xl border border-[#dfe3ea] bg-white px-2 font-bold"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </article>
        );
      })}
    </div>
  );
}
