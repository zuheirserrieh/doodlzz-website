"use client";

import Link from "next/link";
import { CartIcon, MenuIcon, SettingsIcon, UserIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { useDict, useStore } from "@/components/store-provider";

const iconButton =
  "flex size-11 items-center justify-center rounded-xl text-navy hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent";

export function Header() {
  const { locale, cartCount, setMenuOpen } = useStore();
  const t = useDict();

  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="flex h-[34px] items-center justify-center bg-navy text-xs font-bold tracking-[0.02em] text-white">
        {t.announcement}
      </div>
      <div className="border-b border-line">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center gap-1 px-2">
          <button type="button" aria-label={t.nav.openMenu} onClick={() => setMenuOpen(true)} className={iconButton}>
            <MenuIcon />
          </button>
          <Link href={`/${locale}`} aria-label={t.nav.home} className="flex-1 hover:text-navy">
            <Logo className="text-[28px]" />
          </Link>
          <button type="button" aria-label={t.nav.settings} onClick={() => setMenuOpen(true)} className={iconButton}>
            <SettingsIcon />
          </button>
          {/* TODO: accounts aren't built yet — sign-in links to the menu for now. */}
          <button type="button" aria-label={t.nav.signIn} onClick={() => setMenuOpen(true)} className={iconButton}>
            <UserIcon />
          </button>
          <Link href={`/${locale}/cart`} aria-label={t.nav.cart(cartCount)} className={`relative ${iconButton}`}>
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute end-[3px] top-[5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
