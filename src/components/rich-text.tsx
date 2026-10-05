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
          <Link key={i} href={href} className="font-bold text-accent underline decoration-2 underline-offset-2">
            {part}
          </Link>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
