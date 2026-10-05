/** "Doodl" + coral "zz" wordmark used in the header, menu and admin panel. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      dir="ltr"
      style={{ fontFamily: "var(--font-logo), sans-serif" }}
      className={`font-semibold tracking-[-0.01em] text-navy ${className}`}
    >
      Doodl<span className="text-accent">zz</span>
    </span>
  );
}
