"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/catalog-provider";
import { AuthForm, NewPasswordForm } from "@/components/auth-form";
import { useDict, usePrice, useStore } from "@/components/store-provider";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

type OrderSummary = {
  id: number;
  created_at: string;
  total_usd: number;
  status: string;
  items: { name: string; name_ar?: string; qty: number }[];
};

export function AccountView() {
  const { locale } = useStore();
  const t = useDict();
  const price = usePrice();
  const { session, email, isAdmin, authReady, recovery, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !session) return;
    supabase
      .from("orders")
      .select("id, created_at, total_usd, status, items")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as OrderSummary[]) ?? []));
  }, [session]);

  const shell = (children: ReactNode) => (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-8">
      <h1 className="font-display text-[28px] font-bold">{t.account.title}</h1>
      {children}
    </div>
  );

  if (!supabaseConfigured) return shell(<p className="text-ink-soft">{t.account.notConfigured}</p>);
  if (!authReady) return shell(<div className="h-40 animate-pulse rounded-2xl bg-surface" />);

  if (!session) {
    return shell(<AuthForm texts={t.account.auth} redirectPath={`/${locale}/account`} />);
  }
  if (recovery) return shell(<NewPasswordForm texts={t.account.auth} />);

  const meta = session.user.user_metadata as { full_name?: string; phone?: string };

  const dateFormat = new Intl.DateTimeFormat(locale === "ar" ? "ar-LB-u-nu-latn" : "en-GB", { dateStyle: "medium" });

  return shell(
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-4">
        <span className="flex min-w-0 flex-col text-sm">
          {meta.full_name && <span className="text-base font-extrabold">{meta.full_name}</span>}
          <span className="truncate font-bold" dir="auto">
            {t.account.signedInAs(email ?? "")}
          </span>
          {meta.phone && (
            <span dir="ltr" className="text-muted rtl:text-end">
              {meta.phone}
            </span>
          )}
        </span>
        <button type="button" onClick={signOut} className="min-h-10 cursor-pointer text-sm font-bold text-accent underline">
          {t.account.signOut}
        </button>
      </div>

      {isAdmin && (
        <Link href="/admin" className="flex h-12 items-center justify-center rounded-full bg-navy font-extrabold text-white hover:text-white">
          {t.account.adminLink}
        </Link>
      )}

      <section>
        <h2 className="text-lg font-extrabold">{t.account.orders}</h2>
        {orders === null ? (
          <div className="mt-3 h-24 animate-pulse rounded-2xl bg-surface" />
        ) : orders.length === 0 ? (
          <p className="mt-3 text-muted">{t.account.noOrders}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {orders.map((o) => (
              <li key={o.id} className="rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold">{t.account.orderNo(o.id)}</span>
                  <span className="rounded-full bg-pastel-blue px-3 py-1 text-xs font-extrabold">
                    {t.account.status[o.status] ?? o.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{dateFormat.format(new Date(o.created_at))}</p>
                <p className="mt-2 text-sm">
                  {o.items.map((i) => `${i.qty} × ${(locale === "ar" && i.name_ar) || i.name}`).join(" · ")}
                </p>
                <p className="mt-2 font-extrabold">{price(Number(o.total_usd))}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>,
  );
}
