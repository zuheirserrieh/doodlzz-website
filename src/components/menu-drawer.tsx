"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { categories } from "@/data/catalog";
import { ChevronIcon, CategoryIcon, CloseIcon, WhatsAppIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { useDict, useStore, type Currency } from "@/components/store-provider";
import type { Locale } from "@/lib/i18n";
import { whatsappLink } from "@/lib/site";

function Segment<T extends string>({
  label,
  value,
  options,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; href?: string; onSelect?: () => void }[];
}) {
  const base =
    "flex h-10 min-w-16 items-center justify-center rounded-full px-3.5 text-[13px] font-extrabold cursor-pointer";
  return (
    <div className="flex items-center justify-between">
      <span className="text-[15px] font-bold">{label}</span>
      <div role="group" aria-label={label} className="flex rounded-full bg-line p-1">
        {options.map((o) => {
          const active = o.value === value;
          const cls = `${base} ${active ? "bg-navy text-white hover:text-white" : "bg-transparent text-navy"}`;
          return o.href ? (
            <Link key={o.value} href={o.href} aria-current={active ? "true" : undefined} className={cls}>
              {o.label}
            </Link>
          ) : (
            <button key={o.value} type="button" aria-pressed={active} onClick={o.onSelect} className={cls}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MenuDrawer() {
  const { locale, currency, setCurrency, menuOpen, setMenuOpen } = useStore();
  const t = useDict();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close whenever the route changes (link clicked inside the drawer).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [menuOpen, setMenuOpen]);

  const switchLocale = (target: Locale) => pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${target}`);

  return (
    <div
      className={`fixed inset-0 z-50 transition-[visibility] ${menuOpen ? "visible" : "invisible delay-200"}`}
      inert={!menuOpen}
    >
      <div
        className={`absolute inset-0 bg-navy/40 transition-opacity duration-200 ${menuOpen ? "opacity-100" : "opacity-0"}`}
        onClick={() => setMenuOpen(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.menu.title}
        className={`absolute inset-y-0 start-0 flex w-full max-w-[420px] flex-col overflow-y-auto bg-white pb-8 shadow-xl transition-transform duration-200 ${
          menuOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line ps-4 pe-2">
          <Logo className="text-[28px]" />
          <button
            type="button"
            aria-label={t.nav.closeMenu}
            onClick={() => setMenuOpen(false)}
            className="flex size-11 items-center justify-center rounded-xl hover:bg-surface"
          >
            <CloseIcon />
          </button>
        </div>

        {/* TODO: wire to real accounts once a backend is chosen. */}
        <div className="mx-4 mt-4 flex flex-col gap-3 rounded-[20px] bg-pastel-blue p-[18px]">
          <div className="text-[15px] font-bold">{t.menu.pitch}</div>
          <div className="flex gap-2.5">
            <a href="#" className="flex h-[46px] flex-1 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white hover:bg-accent-dark hover:text-white">
              {t.menu.signIn}
            </a>
            <a href="#" className="flex h-[46px] flex-1 items-center justify-center rounded-full border-2 border-navy text-sm font-extrabold">
              {t.menu.createAccount}
            </a>
          </div>
        </div>

        <nav aria-label={t.menu.catalog} className="flex flex-col px-4 pt-6">
          <span className="mb-1.5 text-[13px] font-extrabold uppercase tracking-[0.04em] text-muted">{t.menu.catalog}</span>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${locale}/category/${c.slug}`}
              onClick={() => setMenuOpen(false)}
              className="flex h-[52px] items-center gap-3.5 border-b border-line text-[15px] font-bold"
            >
              <CategoryIcon name={c.icon} size={26} strokeWidth={1.9} />
              <span className="flex-1">{c.name[locale]}</span>
              <ChevronIcon className="text-faint rtl:rotate-180" />
            </Link>
          ))}
        </nav>

        <section className="flex flex-col gap-3.5 px-4 pt-7">
          <span className="text-[13px] font-extrabold uppercase tracking-[0.04em] text-muted">{t.menu.settings}</span>
          <Segment<Locale>
            label={t.menu.language}
            value={locale}
            options={[
              { value: "en", label: "English", href: switchLocale("en") },
              { value: "ar", label: "العربية", href: switchLocale("ar") },
            ]}
          />
          <Segment<Currency>
            label={t.menu.currency}
            value={currency}
            options={[
              { value: "usd", label: "USD", onSelect: () => setCurrency("usd") },
              { value: "lbp", label: "LBP", onSelect: () => setCurrency("lbp") },
            ]}
          />
        </section>

        <a
          href={whatsappLink(t.whatsapp.greeting)}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 mt-7 flex h-14 shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-whatsapp text-[15px] font-extrabold text-white hover:text-white hover:brightness-110"
        >
          <WhatsAppIcon />
          {t.menu.whatsapp}
        </a>
      </div>
    </div>
  );
}
