"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/components/catalog-provider";
import {
  AgeIcon,
  CategoryIcon,
  ChevronIcon,
  CloseIcon,
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import { useDict, useStore } from "@/components/store-provider";
import { ageGroups, categories } from "@/data/catalog";
import type { Locale } from "@/lib/i18n";
import { site, whatsappLink } from "@/lib/site";

const row = "flex min-h-[52px] w-full items-center gap-3 border-b border-line text-start text-[15px] font-bold";
const subRow = "flex min-h-11 items-center gap-3 ps-3 text-[15px] font-semibold";

/** A menu row that opens a sub-list (Catalog, Shop by age, Contact us). */
function Expandable({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={`${row} cursor-pointer border-b-0`}>
        <span className="flex-1">{label}</span>
        <ChevronIcon className={`text-faint transition-transform ${open ? "rotate-90" : "rtl:rotate-180"}`} />
      </button>
      {open && <div className="flex flex-col pb-2">{children}</div>}
    </div>
  );
}

export function MenuDrawer() {
  const { locale, menuOpen, setMenuOpen } = useStore();
  const { email } = useAuth();
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
  const close = () => setMenuOpen(false);
  const href = (path: string) => `/${locale}${path}`;
  const chevron = <ChevronIcon className="text-faint rtl:rotate-180" />;

  return (
    <div className={`fixed inset-0 z-50 transition-[visibility] ${menuOpen ? "visible" : "invisible delay-200"}`} inert={!menuOpen}>
      <div
        className={`absolute inset-0 bg-navy/40 transition-opacity duration-200 ${menuOpen ? "opacity-100" : "opacity-0"}`}
        onClick={close}
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
            onClick={close}
            className="flex size-11 cursor-pointer items-center justify-center rounded-xl hover:bg-surface"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label={t.menu.title} className="flex flex-col px-4 pt-2">
          <Link href={href("")} onClick={close} className={row}>
            <span className="flex-1">{t.menu.home}</span>
            {chevron}
          </Link>

          <Expandable label={t.menu.catalog}>
            <Link href={href("/shop")} onClick={close} className={`${subRow} text-accent`}>
              {t.menu.allProducts}
            </Link>
            {categories.map((c) => (
              <Link key={c.slug} href={href(`/category/${c.slug}`)} onClick={close} className={subRow}>
                <CategoryIcon name={c.icon} size={24} strokeWidth={1.9} />
                {c.name[locale]}
              </Link>
            ))}
          </Expandable>

          <Expandable label={t.menu.shopByAge}>
            {ageGroups.map((a) => (
              <Link key={a.slug} href={href(`/shop?age=${a.slug}`)} onClick={close} className={subRow}>
                <AgeIcon slug={a.slug} size={26} />
                <span>
                  <span dir="ltr">{a.label}</span> {a.unit === "months" ? t.age.months : t.age.years}
                </span>
              </Link>
            ))}
          </Expandable>

          <div className="my-3 h-0.5 rounded-full bg-line" role="separator" />

          <Link href={href("/about")} onClick={close} className={row}>
            <span className="flex-1">{t.menu.about}</span>
            {chevron}
          </Link>
          <Link href={href("/delivery")} onClick={close} className={row}>
            <span className="flex-1">{t.menu.deliveryPayment}</span>
            {chevron}
          </Link>
          <Link href={href("/account")} onClick={close} className={row}>
            <span className="flex min-w-0 flex-1 flex-col">
              {t.menu.account}
              {email && (
                <span className="truncate text-xs font-semibold text-muted" dir="ltr">
                  {email}
                </span>
              )}
            </span>
            {chevron}
          </Link>
          <Link href={href("/favorites")} onClick={close} className={row}>
            <span className="flex-1">{t.menu.favorites}</span>
            {chevron}
          </Link>

          <Expandable label={t.menu.contact}>
            {[
              { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
              { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
              { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
              { href: whatsappLink(t.whatsapp.greeting), label: "WhatsApp", Icon: WhatsAppIcon },
            ].map(({ href: link, label, Icon }) => (
              <a key={label} href={link} target="_blank" rel="noopener noreferrer" className={subRow}>
                <Icon size={22} />
                {label}
              </a>
            ))}
            <a href={`tel:${site.phoneTel}`} className={subRow}>
              <PhoneIcon size={22} />
              <span>
                {t.menu.call} · <span dir="ltr">{site.phoneDisplay}</span>
              </span>
            </a>
          </Expandable>
        </nav>

        <div className="flex items-center justify-between px-4 pt-6">
          <span className="text-[15px] font-bold">{t.menu.language}</span>
          <div role="group" aria-label={t.menu.language} className="flex rounded-full bg-line p-1">
            {(["en", "ar"] as const).map((l) => (
              <Link
                key={l}
                href={switchLocale(l)}
                aria-current={l === locale ? "true" : undefined}
                className={`flex h-10 min-w-16 items-center justify-center rounded-full px-3.5 text-[13px] font-extrabold ${
                  l === locale ? "bg-navy text-white hover:text-white" : "text-navy"
                }`}
              >
                {l === "en" ? "English" : "العربية"}
              </Link>
            ))}
          </div>
        </div>

        <a
          href={whatsappLink(t.whatsapp.greeting)}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 mt-6 flex h-14 shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] text-[15px] font-extrabold text-white hover:text-white hover:brightness-105"
        >
          <WhatsAppIcon />
          {t.menu.whatsapp}
        </a>
      </div>
    </div>
  );
}
