/**
 * Doodlzz wordmark in the lettering style of the logo (retro script, coral with a pink shadow).
 * The full round logo (public/brand/doodlzz-logo.jpg) is too detailed for the header,
 * so it's shown in the footer and on the About page instead.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      dir="ltr"
      style={{
        fontFamily: "var(--font-logo), cursive",
        color: "#EE4553",
        textShadow: "2px 2px 0 #FBC4C8",
        letterSpacing: "0.01em",
      }}
      className={`inline-block leading-none ${className}`}
    >
      Doodlzz
    </span>
  );
}
