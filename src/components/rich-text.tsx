import Link from "next/link";
import { Fragment } from "react";

/**
 * Renders dictionary text where words in [[double brackets]] link to another page
 * (by default the Delivery & Payment page), in the accent colour.
 */
export function RichText({ text, href }: { text: string; href: string }) {
  return (
    <>
      {text.split(/\[\[(.+?)\]\]/).map((part, i) =>
        i % 2 === 1 ? (
          <Link key={i} href={href} className="rounded-md bg-white/70 px-1 font-extrabold text-accent no-underline">
            {part}
          </Link>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
