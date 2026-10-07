"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ChevronIcon } from "@/components/icons";

/** ‹ › buttons that scroll a horizontal row by about one screen; hidden when there's nothing to scroll to. */
export function ScrollArrows({ target, className = "" }: { target: RefObject<HTMLElement | null>; className?: string }) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const pos = Math.abs(el.scrollLeft); // negative in RTL
      setCanPrev(pos > 4);
      setCanNext(pos < max - 4);
    };
    const first = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // Content can arrive later (products load after the page).
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(first);
      el.removeEventListener("scroll", update);
      ro.disconnect();
      mo.disconnect();
    };
  }, [target]);

  function go(dir: 1 | -1) {
    const el = target.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: "smooth" });
  }

  const btn =
    "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-navy shadow-md ring-1 ring-line hover:bg-white";
  return (
    <>
      {canPrev && (
        <button type="button" aria-label="Previous" onClick={() => go(-1)} className={`${btn} start-1 ${className}`}>
          <ChevronIcon size={20} strokeWidth={2.6} className="rotate-180 rtl:rotate-0" />
        </button>
      )}
      {canNext && (
        <button type="button" aria-label="Next" onClick={() => go(1)} className={`${btn} end-1 ${className}`}>
          <ChevronIcon size={20} strokeWidth={2.6} className="rtl:rotate-180" />
        </button>
      )}
    </>
  );
}

/** A horizontally scrolling row with ‹ › arrows (for server components that can't hold a ref). */
export function ScrollRow({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative">
      <div ref={ref} className={className}>
        {children}
      </div>
      <ScrollArrows target={ref} />
    </div>
  );
}
