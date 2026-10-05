"use client";

import Link from "next/link";
import { useDict, useStore } from "@/components/store-provider";

export default function NotFound() {
  const { locale } = useStore();
  const t = useDict();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">{t.notFound.title}</h1>
      <p className="text-muted">{t.notFound.text}</p>
      <Link
        href={`/${locale}`}
        className="mt-3 flex h-12 items-center rounded-full bg-accent px-6 font-extrabold text-white hover:text-white"
      >
        {t.notFound.home}
      </Link>
    </div>
  );
}
