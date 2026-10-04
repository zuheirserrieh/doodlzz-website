"use client";

import Link from "next/link";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { useDict, useStore } from "@/components/store-provider";
import { site, whatsappLink } from "@/lib/site";

export function Footer() {
  const { locale } = useStore();
  const t = useDict();
  const link = "flex min-h-9 items-center text-sm";
  const heading = "mb-1 text-[13px] font-extrabold uppercase tracking-[0.04em] text-muted";

  return (
    <footer className="mt-11 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-7 px-4 pt-8 pb-7 md:flex-row md:gap-16">
        <div className="flex flex-col gap-2 md:max-w-sm">
          <Logo className="text-[26px]" />
          <h2 className="mt-1 text-base font-extrabold">{t.footer.aboutTitle}</h2>
          {/* TODO(owner): real "About us" text. */}
          <p className="text-sm leading-relaxed text-ink-soft">{t.footer.about}</p>
          <div className="mt-2 flex gap-3">
            {[
              { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
              { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
              { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-11 items-center justify-center rounded-full bg-white"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-6">
          <nav aria-label={t.footer.shop} className="flex flex-col gap-0.5">
            <span className={heading}>{t.footer.shop}</span>
            <Link href={`/${locale}/shop`} className={link}>{t.catalog.title}</Link>
            <Link href={`/${locale}/shop?tab=best`} className={link}>{t.picked.best}</Link>
            <Link href={`/${locale}/shop?tab=new`} className={link}>{t.picked.fresh}</Link>
            <Link href={`/${locale}/#shop-by-age`} className={link}>{t.footer.shopByAge}</Link>
          </nav>
          {/* TODO: delivery / exchange / account pages. */}
          <nav aria-label={t.footer.help} className="flex flex-col gap-0.5">
            <span className={heading}>{t.footer.help}</span>
            <a href={whatsappLink(t.whatsapp.greeting)} target="_blank" rel="noopener noreferrer" className={link}>
              {t.footer.contact}
            </a>
            <a href="#" className={link}>{t.footer.deliveryLink}</a>
            <a href="#" className={link}>{t.footer.exchangeLink}</a>
            <a href="#" className={link}>{t.footer.account}</a>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-24">
        <div className="border-t border-[#e2ddd4] pt-[18px] text-xs text-muted">{t.footer.rights(new Date().getFullYear())}</div>
      </div>
    </footer>
  );
}
