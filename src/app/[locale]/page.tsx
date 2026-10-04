import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import {
  BrandsMarquee,
  CategoryGrid,
  FollowUs,
  RealMoments,
  SearchBar,
  ShopByAge,
} from "@/components/home-sections";
import { PickedByParents } from "@/components/picked-by-parents";
import { isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <SearchBar locale={locale} />
      <ShopByAge locale={locale} />
      <Hero />
      <CategoryGrid locale={locale} />
      <PickedByParents />
      <RealMoments locale={locale} />
      <BrandsMarquee locale={locale} />
      <FollowUs locale={locale} />
    </>
  );
}
