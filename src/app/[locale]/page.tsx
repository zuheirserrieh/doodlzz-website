import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import { BrandsMarquee, CategoryGrid, FollowUs, RealMoments, WavySeparator } from "@/components/home-sections";
import { PickedByParents } from "@/components/picked-by-parents";
import { ShopByAge } from "@/components/shop-by-age";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <Hero />
      <CategoryGrid locale={locale} />
      <ShopByAge title={t.age.orTitle} />
      <PickedByParents />
      <WavySeparator />
      <RealMoments locale={locale} />
      <BrandsMarquee locale={locale} />
      <FollowUs locale={locale} />
    </>
  );
}
