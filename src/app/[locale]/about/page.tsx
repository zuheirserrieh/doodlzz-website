/* eslint-disable @next/next/no-img-element -- static logo file, already sized */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/rich-text";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).about.title };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 pt-8">
      <img src="/brand/doodlzz-logo.jpg" alt="Doodlzz" width={940} height={788} className="w-64 max-w-full" />
      <h1 className="self-start font-display text-3xl font-extrabold">{t.about.title}</h1>
      {t.about.paragraphs.map((p) => (
        <p key={p.slice(0, 24)} className="text-[17px] leading-relaxed text-ink-soft">
          <RichText text={p} href={`/${locale}/delivery`} />
        </p>
      ))}
      <Link href={`/${locale}/shop`} className="mt-2 flex h-12 items-center rounded-full bg-accent px-7 font-extrabold text-white hover:text-white">
        {t.about.cta}
      </Link>
    </div>
  );
}
