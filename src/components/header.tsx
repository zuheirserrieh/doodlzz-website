"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartIcon, HeartIcon, MenuIcon, UserIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { WhishLogo } from "@/components/whish-logo";
import { useDict, useStore } from "@/components/store-provider";

const iconButton =
  "relative flex size-11 items-center justify-center rounded-xl text-navy hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute end-[3px] top-[5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-white">
      {count}
    </span>
  );
}

/** Top strip that alternates between the store's key messages. */
function AnnouncementBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4000);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="relative h-[34px] overflow-hidden bg-navy text-xs font-bold tracking-[0.02em] text-white">
      {messages.map((m, i) => (
        <p
          key={m}
          aria-hidden={i !== index}
          className={`absolute inset-0 flex items-center justify-center px-3 text-center whitespace-nowrap transition-all duration-500 ${
            i === index ? "translate-y-0 opacity-100" : i < index ? "-translate-y-full opacity-0" : "translate-y-full opacity-0"
          }`}
        >
          {m}
          {m.includes("Whish") && <WhishLogo className="ms-1.5 h-4" />}
        </p>
      ))}
    </div>
  );
}

export function Header() {
  const { locale, cartCount, wishlist, setMenuOpen, setCartOpen } = useStore();
  const t = useDict();

  return (
    <header className="sticky top-0 z-30 bg-white">
      <AnnouncementBar messages={t.announcements} />
      <div className="border-b border-line">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center gap-1 px-2">
          <button type="button" aria-label={t.nav.openMenu} onClick={() => setMenuOpen(true)} className={iconButton}>
            <MenuIcon />
          </button>
          <Link href={`/${locale}`} aria-label={t.nav.home} className="flex-1 hover:text-navy">
            <Logo height={46} />
          </Link>
          <Link href={`/${locale}/account`} aria-label={t.account.title} className={iconButton}>
            <UserIcon />
          </Link>
          <Link href={`/${locale}/favorites`} aria-label={t.nav.favorites(wishlist.length)} className={iconButton}>
            <HeartIcon size={22} />
            <CountBadge count={wishlist.length} />
          </Link>
          <button type="button" aria-label={t.nav.cart(cartCount)} onClick={() => setCartOpen(true)} className={`cursor-pointer ${iconButton}`}>
            <CartIcon />
            <CountBadge count={cartCount} />
          </button>
        </div>
      </div>
    </header>
  );
}
