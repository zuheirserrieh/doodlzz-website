import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { WhishLogo } from "@/components/whish-logo";
import { getDictionary, isLocale } from "@/lib/i18n";
import { whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/delivery">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).deliveryPage.title };
}

export default async function DeliveryPage({ params }: PageProps<"/[locale]/delivery">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const page = t.deliveryPage;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-9 px-4 pt-8">
      <h1 className="font-display text-3xl font-extrabold">{page.title}</h1>

      <section id="delivery" className="flex scroll-mt-28 flex-col gap-3">
        <h2 className="text-2xl font-extrabold">{page.deliveryHeading}</h2>
        <p className="text-[17px] leading-relaxed text-ink-soft">{page.deliveryIntro}</p>
        <ol className="flex flex-col gap-3">
          {page.options.map((o, i) => (
            <li key={o.title} className="flex gap-3 rounded-2xl bg-surface p-4">
              <span className="flex size-8 flex-none items-center justify-center rounded-full bg-navy text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[17px] font-extrabold">{o.title}</span>
                <span className="leading-relaxed text-ink-soft">{o.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section id="payment" className="flex scroll-mt-28 flex-col gap-3">
        <h2 className="text-2xl font-extrabold">{page.paymentHeading}</h2>
        <p className="text-[17px] leading-relaxed text-ink-soft">{page.paymentIntro}</p>
        <p className="font-bold">{page.chooseBetween}</p>
        <ul className="flex flex-col gap-3">
          {page.methods.map((m) => (
            <li key={m.id} className="flex gap-3 rounded-2xl bg-surface p-4">
              <span className="flex h-8 w-12 flex-none items-center justify-center text-2xl" aria-hidden>
                {m.id === "whish" ? <WhishLogo className="h-6" /> : "💵"}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[17px] font-extrabold">{m.title}</span>
                <span className="leading-relaxed text-ink-soft">{m.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <a
        href={whatsappLink(t.whatsapp.greeting)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-2xl bg-pastel-mint p-4 font-bold hover:text-navy"
      >
        <span className="flex size-11 flex-none items-center justify-center rounded-full bg-[#25D366] text-white">
          <WhatsAppIcon size={22} />
        </span>
        {page.closing}
      </a>
    </div>
  );
}
