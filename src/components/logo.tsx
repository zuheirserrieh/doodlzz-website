// TODO(owner): swap for the real logo file once provided.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span dir="ltr" style={{ fontFamily: "var(--font-fredoka), sans-serif" }} className={`font-semibold tracking-[-0.01em] text-navy ${className}`}>
      Doodl<span className="text-accent">zz</span>
    </span>
  );
}
