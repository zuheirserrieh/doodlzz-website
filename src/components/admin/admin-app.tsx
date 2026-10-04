"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AdminOrders } from "@/components/admin/admin-orders";
import { AdminProducts } from "@/components/admin/admin-products";
import { useAuth } from "@/components/catalog-provider";
import { EmailSignIn } from "@/components/email-sign-in";
import { Logo } from "@/components/logo";
import { supabaseConfigured } from "@/lib/supabase";

type Tab = "orders" | "products";

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mt-16 flex max-w-sm flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-baseline gap-2">
        <Logo className="text-[28px]" />
        <span className="text-sm font-extrabold uppercase tracking-[0.06em] text-muted">Admin</span>
      </div>
      {children}
    </div>
  );
}

export function AdminApp() {
  const { session, email, isAdmin, adminChecked, authReady, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");

  if (!supabaseConfigured) {
    return (
      <Card>
        <p className="text-ink-soft">
          The database isn&apos;t connected yet. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see docs/SETUP.md).
        </p>
      </Card>
    );
  }

  if (!authReady || (session && !adminChecked)) {
    return (
      <Card>
        <div className="h-32 animate-pulse rounded-2xl bg-surface" />
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <EmailSignIn
          redirectPath="/admin"
          texts={{
            intro: "Sign in with the admin email. We'll email you a sign-in link.",
            email: "Admin email",
            sendCode: "Send sign-in link",
            sending: "Please wait…",
            codeSent: (e) => `We sent an email to ${e}. Open the link in it to sign in (check spam too). If the email shows a code, enter it below.`,
            code: "Code",
            verify: "Sign in",
            changeEmail: "Use another email",
            error: "That code didn't work. Try again or request a new one.",
          }}
        />
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <p className="text-ink-soft">
          <strong>{email}</strong> is not an admin account.
        </p>
        <button type="button" onClick={signOut} className="h-12 cursor-pointer rounded-full bg-navy font-extrabold text-white">
          Sign out
        </button>
      </Card>
    );
  }

  const tabClass = (id: Tab) =>
    `h-11 cursor-pointer rounded-full px-5 text-sm font-extrabold ${tab === id ? "bg-navy text-white" : "bg-white text-navy"}`;

  return (
    <div className="min-h-dvh pb-16">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <Logo className="text-2xl" />
          <span className="text-xs font-extrabold uppercase tracking-[0.06em] text-muted">Admin</span>
          <span className="flex-1" />
          <Link href="/en" target="_blank" className="hidden text-sm font-bold sm:inline">
            View site ↗
          </Link>
          <button type="button" onClick={signOut} className="min-h-10 cursor-pointer px-2 text-sm font-bold text-accent underline">
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-5">
        <p className="text-sm text-muted">Signed in as {email}</p>
        <div role="tablist" className="mt-3 flex gap-2">
          <button type="button" role="tab" aria-selected={tab === "orders"} onClick={() => setTab("orders")} className={tabClass("orders")}>
            Orders
          </button>
          <button type="button" role="tab" aria-selected={tab === "products"} onClick={() => setTab("products")} className={tabClass("products")}>
            Products
          </button>
        </div>
        <div className="mt-5">{tab === "orders" ? <AdminOrders /> : <AdminProducts />}</div>
      </div>
    </div>
  );
}
