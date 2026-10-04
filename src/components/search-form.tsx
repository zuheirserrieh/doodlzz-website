"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ChevronIcon, SearchIcon } from "@/components/icons";
import { useDict, useStore } from "@/components/store-provider";
import { ageGroups, categories } from "@/data/catalog";

/** Scope values look like "age:0-6m" or "category:strollers"; "" means everything. */
function parseScope(scope: string) {
  const [kind, slug] = scope.split(":");
  return kind === "age" || kind === "category" ? { kind, slug } : null;
}

export function SearchForm({
  defaultQuery = "",
  defaultScope = "",
  className = "",
}: {
  defaultQuery?: string;
  defaultScope?: string;
  className?: string;
}) {
  const { locale } = useStore();
  const t = useDict();
  const router = useRouter();
  const [scope, setScope] = useState(defaultScope);
  const [query, setQuery] = useState(defaultQuery);

  const ageLabel = (a: (typeof ageGroups)[number]) => `${a.label} ${a.unit === "months" ? t.age.months : t.age.years}`;
  const parsed = parseScope(scope);
  const scopeLabel = !parsed
    ? t.search.all
    : parsed.kind === "age"
      ? ageLabel(ageGroups.find((a) => a.slug === parsed.slug) ?? ageGroups[0])
      : (categories.find((c) => c.slug === parsed.slug)?.shortName[locale] ?? t.search.all);

  function go(nextScope: string) {
    const target = parseScope(nextScope);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (target) params.set(target.kind, target.slug);
    const qs = params.toString();
    router.push(`/${locale}/shop${qs ? `?${qs}` : ""}`);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    go(scope);
  }

  return (
    <form role="search" onSubmit={submit} className={`flex h-12 items-center gap-1 rounded-full bg-white shadow-[0_2px_10px_rgba(30,39,66,0.10)] ring-1 ring-[#e3e7ee] ${className}`}>
      {/* Native select (invisible) over a styled label: native picker on phones, full keyboard support. */}
      <div className="relative flex h-full max-w-[42%] flex-none items-center gap-1 rounded-full border-2 border-navy ps-4 pe-3 text-sm font-extrabold text-navy focus-within:outline-2 focus-within:outline-accent">
        <span className="truncate">{scopeLabel}</span>
        <ChevronIcon size={14} strokeWidth={2.6} className="flex-none rotate-90" />
        <select
          aria-label={t.search.scope}
          value={scope}
          onChange={(e) => {
            setScope(e.target.value);
            // Picking an age or category with nothing typed jumps straight to it.
            if (!query.trim() && e.target.value) go(e.target.value);
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          <option value="">{t.search.all}</option>
          <optgroup label={t.search.byAge}>
            {ageGroups.map((a) => (
              <option key={a.slug} value={`age:${a.slug}`}>
                {ageLabel(a)}
              </option>
            ))}
          </optgroup>
          <optgroup label={t.search.categories}>
            {categories.map((c) => (
              <option key={c.slug} value={`category:${c.slug}`}>
                {c.name[locale]}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      <label htmlFor="dz-search" className="sr-only">
        {t.search.label}
      </label>
      <input
        id="dz-search"
        name="q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search.placeholder}
        className="h-full min-w-0 flex-1 bg-transparent px-2 text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-faint"
      />
      <button type="submit" aria-label={t.search.submit} className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full text-navy hover:text-accent">
        <SearchIcon size={22} />
      </button>
    </form>
  );
}
