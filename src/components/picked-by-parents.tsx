"use client";

import Link from "next/link";
import { useState } from "react";
import { useCatalog } from "@/components/catalog-provider";
import { ProductGrid } from "@/components/product-card";
import { useDict, useStore } from "@/components/store-provider";

type Tab = "best" | "new";

export function PickedByParents() {
  const { locale } = useStore();
  const t = useDict();
  const { products } = useCatalog();
  const [tab, setTab] = useState<Tab>("best");
  const list = products.filter((p) => (tab === "best" ? p.bestSeller : p.isNew)).slice(0, 4);

  const tabs: { id: Tab; label: string }[] = [
    { id: "best", label: t.picked.best },
    { id: "new", label: t.picked.fresh },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <h2 className="font-display text-2xl font-bold">{t.picked.title}</h2>
      <div role="tablist" className="mt-3.5 flex gap-2">
        {tabs.map((x) => (
          <button
            key={x.id}
            id={`tab-${x.id}`}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            aria-controls="picked-panel"
            onClick={() => setTab(x.id)}
            className={`h-11 cursor-pointer rounded-full px-[18px] text-sm font-extrabold ${
              tab === x.id ? "bg-navy text-white" : "bg-line text-navy"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div id="picked-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-[18px]">
        <ProductGrid products={list} />
      </div>
      <Link
        href={`/${locale}/shop?tab=${tab}`}
        className="mt-[22px] flex h-12 items-center justify-center rounded-full border-2 border-navy text-[15px] font-extrabold md:mx-auto md:max-w-xs"
      >
        {t.picked.seeAll}
      </Link>
    </section>
  );
}
