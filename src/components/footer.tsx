"use client";

import Link from "next/link";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons";
import { RichText } from "@/components/rich-text";
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
        <div className="flex flex-col items-center gap-2 text-center md:max-w-sm md:items-start md:text-start">
          <h2 className="mt-1 text-base font-extrabold">{t.footer.aboutTitle}</h2>
          {t.footer.about.map((p) => (
            <p key={p.slice(0, 20)} className="text-sm leading-relaxed text-ink-soft">
              <RichText text={p} href={`/${locale}/delivery`} />
            </p>
          ))}
          <Link href={`/${locale}/about`} className="text-sm font-extrabold text-accent">
            {t.footer.readStory}
          </Link>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-6">
          <nav aria-label={t.footer.shop} className="flex flex-col gap-0.5">
            <span className={heading}>{t.footer.shop}</span>
            <Link href={`/${locale}/shop`} className={link}>{t.catalog.title}</Link>
            <Link href={`/${locale}/shop?tab=best`} className={link}>{t.picked.best}</Link>
            <Link href={`/${locale}/shop?tab=new`} className={link}>{t.picked.fresh}</Link>
            <Link href={`/${locale}/#shop-by-age`} className={link}>{t.footer.shopByAge}</Link>
          </nav>
          <nav aria-label={t.footer.help} className="flex flex-col gap-0.5">
            <span className={heading}>{t.footer.help}</span>
            <a href={whatsappLink(t.whatsapp.greeting)} target="_blank" rel="noopener noreferrer" className={link}>
              {t.footer.contact}
            </a>
            <Link href={`/${locale}/delivery`} className={link}>{t.menu.deliveryPayment}</Link>
            <Link href={`/${locale}/about`} className={link}>{t.menu.about}</Link>
            <Link href={`/${locale}/account`} className={link}>{t.footer.account}</Link>
          </nav>
        </div>
      </div>
      <section aria-labelledby="get-in-touch" className="mx-auto max-w-6xl px-4 pb-7">
        <h2 id="get-in-touch" className={heading}>
          {t.contact.title}
        </h2>
        <div className="mt-2 grid gap-2.5 sm:grid-cols-3">
          {[
            { href: `tel:${site.phoneTel}`, label: t.contact.call, value: site.phoneDisplay, Icon: PhoneIcon, external: false },
            { href: whatsappLink(t.whatsapp.greeting), label: "WhatsApp", value: site.phoneDisplay, Icon: WhatsAppIcon, external: true },
            { href: `mailto:${site.email}`, label: t.contact.email, value: site.email, Icon: MailIcon, external: false },
          ].map(({ href, label, value, Icon, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex items-center gap-3 rounded-2xl border border-[#e2ddd4] bg-white/60 p-3"
            >
              <span className="flex size-10 flex-none items-center justify-center rounded-full border border-[#e2ddd4] bg-white">
                <Icon size={18} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-muted">{label}</span>
                <span dir="ltr" className="truncate text-[15px] font-bold rtl:text-end">
                  {value}
                </span>
              </span>
            </a>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-3">
          {[
            { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
            { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
            { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
            { href: whatsappLink(t.whatsapp.greeting), label: "WhatsApp", Icon: WhatsAppIcon },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <Icon size={22} />
            </a>
          ))}
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-24">
        <div className="border-t border-[#e2ddd4] pt-[18px] text-xs text-muted">{t.footer.rights(new Date().getFullYear())}</div>
      </div>
    </footer>
  );
}
