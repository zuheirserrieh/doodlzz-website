/* eslint-disable @next/next/no-img-element -- tiny static badge; next/image adds nothing here */

/** Small Whish Money badge (payment method). */
export function WhishLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/brand/whish.jpg"
      alt="Whish Money"
      width={309}
      height={166}
      className={`inline-block w-auto flex-none rounded-[4px] align-middle ${className}`}
    />
  );
}
