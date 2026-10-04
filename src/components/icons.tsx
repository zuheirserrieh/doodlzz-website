import type { ReactNode, SVGProps } from "react";
import type { CategoryIcon as CategoryIconName } from "@/data/catalog";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function stroke(size: number, viewBox: string, strokeWidth: number, props: SVGProps<SVGSVGElement>) {
  return {
    width: size,
    height: size,
    viewBox,
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

const categoryPaths: Record<CategoryIconName, ReactNode> = {
  stroller: (
    <>
      <path d="M4 6h4l3 12h15" />
      <path d="M14 18V8a11 11 0 0 1 12 10" />
      <circle cx="12" cy="25" r="2.5" />
      <circle cx="23" cy="25" r="2.5" />
    </>
  ),
  carSeat: (
    <>
      <path d="M9 5c-2 0-3 1.5-3 3.5V22a4 4 0 0 0 4 4h13a3 3 0 0 0 3-3v-1H13.5L12 8c-.2-1.8-1.3-3-3-3z" />
      <path d="M5 14c5-8 15-8 21 1" />
    </>
  ),
  swing: (
    <>
      <path d="M5 28 11 4h10l6 24" />
      <path d="M14 4v14M18 4v14" />
      <path d="M11 18h10v3a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2z" />
    </>
  ),
  playMat: (
    <>
      <path d="M3 25c0-1.7 5.8-3 13-3s13 1.3 13 3-5.8 3-13 3-13-1.3-13-3z" />
      <path d="M7 23C7 13 11 7 16 7s9 6 9 16" />
      <path d="M16 7v6" />
      <circle cx="16" cy="15" r="2" />
    </>
  ),
  walker: (
    <>
      <ellipse cx="16" cy="9" rx="10" ry="4" />
      <path d="M8 12 6 24M24 12l2 12M13 13v6h6v-6" />
      <circle cx="6" cy="26" r="2" />
      <circle cx="26" cy="26" r="2" />
    </>
  ),
  highChair: (
    <>
      <path d="M11 4v10h11V4" />
      <path d="M8 14h16" />
      <path d="M12 14 9 28M21 14l3 14M10.5 22h11" />
    </>
  ),
  bed: (
    <>
      <path d="M5 6v22M27 6v22M5 11h22M5 24h22" />
      <path d="M10 11v13M14 11v13M18 11v13M22 11v13" />
    </>
  ),
  bathTub: (
    <>
      <path d="M4 14h24v3a7 7 0 0 1-7 7H11a7 7 0 0 1-7-7z" />
      <path d="M9 24l-1 4M23 24l1 4" />
      <circle cx="12" cy="9" r="2" />
      <circle cx="18" cy="7" r="1.5" />
      <circle cx="21" cy="10.5" r="1" />
    </>
  ),
  potty: (
    <>
      <path d="M10 15V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8" />
      <path d="M6 15h20l-2.5 9a3 3 0 0 1-3 2h-9a3 3 0 0 1-3-2z" />
    </>
  ),
};

export function CategoryIcon({ name, size = 36, strokeWidth = 1.8, ...props }: IconProps & { name: CategoryIconName }) {
  return <svg {...stroke(size, "0 0 32 32", Number(strokeWidth), props)}>{categoryPaths[name]}</svg>;
}

export function MenuIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function SettingsIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function UserIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function CartIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6" />
    </svg>
  );
}

export function SearchIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

/** Points "forward" — flip with `rtl:rotate-180` where direction matters. */
export function ChevronIcon({ size = 18, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", Number(strokeWidth), props)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function HeartIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2.2, props)}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}

export function StarIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 1.9, props)}>
      <path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.4-1.8-1.2-2.3-2.3l.8-1-1-2z" />
    </svg>
  );
}

export function InstagramIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />
    </svg>
  );
}

export function TikTokIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.5 3 2.5 5 5.5 5" />
    </svg>
  );
}

export function MinusIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2.2, props)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function PlusIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2.2, props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TruckIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export function SwapIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <path d="M4 8h14l-3-3M20 16H6l3 3" />
    </svg>
  );
}
