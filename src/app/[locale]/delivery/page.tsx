import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TruckIcon } from "@/components/icons";
import { WhishLogo } from "@/components/whish-logo";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/delivery">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).deliveryPage.title };
}

export default async function DeliveryPage({ params }: PageProps<"/[locale]/delivery">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const options = ["standard", "express", "sameday"] as const;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pt-8">
      <h1 className="font-display text-3xl font-extrabold">{t.deliveryPage.title}</h1>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">
          <TruckIcon /> {t.deliveryPage.deliveryHeading}
        </h2>
        <p className="text-ink-soft">{t.deliveryPage.deliveryIntro}</p>
        <ol className="flex flex-col gap-2.5">
          {options.map((key, i) => {
            const o = t.checkout.deliveryOptions[key];
            return (
              <li key={key} className="flex gap-3 rounded-2xl bg-surface p-4">
                <span className="flex size-8 flex-none items-center justify-center rounded-full bg-navy text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="flex flex-col">
                  <span className="font-extrabold">
                    {o.label} · {o.time}
                  </span>
                  <span className="text-sm text-ink-soft">{o.fee}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-ink-soft">{t.checkout.finalizedNote}</p>
        <p className="rounded-2xl bg-pastel-yellow p-4 text-sm font-bold">🛠️ {t.checkout.installNote}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-extrabold">{t.deliveryPage.paymentHeading}</h2>
        <div className="flex flex-wrap gap-2.5">
          <span className="flex h-11 items-center gap-2 rounded-full bg-surface px-4 font-bold">💵 {t.checkout.payCash}</span>
          <span className="flex h-11 items-center gap-2 rounded-full bg-surface px-4 font-bold">
            <WhishLogo className="h-5" /> {t.checkout.payWhish}
          </span>
        </div>
        <p className="text-ink-soft">{t.deliveryPage.paymentText}</p>
      </section>
    </div>
  );
}
