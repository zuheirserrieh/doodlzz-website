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
  baby: (
    <>
      <circle cx="16" cy="11" r="6" />
      <path d="M13.5 10.5h.01M18.5 10.5h.01M14 13.5c1.2 1 2.8 1 4 0" />
      <path d="M8 28c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      <path d="M16 5c1-1.5 3-1.5 3 0" />
    </>
  ),
  girls: (
    <>
      <circle cx="16" cy="9" r="4.5" />
      <path d="M10 9.5c-3-1-4.5 1-4 3M22 9.5c3-1 4.5 1 4 3" />
      <path d="M11 28l2.5-12h5L21 28z" />
      <path d="M12 20h8" />
    </>
  ),
  boys: (
    <>
      <path d="M4 20v-4l3-6h12l5 6h4v4z" />
      <circle cx="10" cy="22" r="3" />
      <circle cx="23" cy="22" r="3" />
      <path d="M9 16h14" />
    </>
  ),
  rideOn: (
    <>
      <circle cx="8" cy="22" r="5" />
      <circle cx="24" cy="22" r="5" />
      <path d="M8 22l5-9h9l2 9M13 13l3 9h6M11 9h4M22 13l-1.5-4h3" />
    </>
  ),
  school: (
    <>
      <path d="M4 7h9a3 3 0 0 1 3 3v17a2.5 2.5 0 0 0-2.5-2.5H4z" />
      <path d="M28 7h-9a3 3 0 0 0-3 3v17a2.5 2.5 0 0 1 2.5-2.5H28z" />
      <path d="M7.5 12h5M7.5 16h5M19.5 12h5M19.5 16h5" />
    </>
  ),
  sport: (
    <>
      <circle cx="16" cy="16" r="11" />
      <path d="M16 10l5 3.5-2 6h-6l-2-6z" />
      <path d="M16 5v5M26.5 13l-5.5.5M22.5 25l-3.5-5.5M9.5 25l3.5-5.5M5.5 13l5.5.5" />
    </>
  ),
  outdoor: (
    <>
      <path d="M5 28V8h6v20" />
      <path d="M5 13h6M5 18h6M5 23h6" />
      <path d="M11 8c6 0 7 4 9 10s4 9 8 10H11" />
    </>
  ),
  home: (
    <>
      <path d="M4 15 16 5l12 10" />
      <path d="M7 13v14h18V13" />
      <path d="M13 27v-7h6v7" />
    </>
  ),
  camping: (
    <>
      <path d="M3 27 16 6l13 21z" />
      <path d="M16 27l-5-8 5-8 5 8-5 8" />
      <path d="M1 27h30" />
    </>
  ),
  winter: (
    <>
      <path d="M16 3v26M4.7 9.5l22.6 13M4.7 22.5l22.6-13" />
      <path d="M12.5 4.5 16 8l3.5-3.5M12.5 27.5 16 24l3.5 3.5" />
    </>
  ),
  adult: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <rect x="12" y="12" width="16" height="16" rx="3" fill="white" />
      <path d="M8.5 8.5h.01M15.5 15.5h.01M17 21h.01M21 17h.01M23 23h.01" strokeWidth="3" />
    </>
  ),
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

/** WhatsApp logo, used everywhere a WhatsApp link appears. */
export function WhatsAppIcon({ size = 24, ...props }: IconProps) {
  return <WhatsAppMark size={size} {...props} />;
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

export function PhoneIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 1.8, props)}>
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function MailIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 1.8, props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function BagIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 11V7a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

/** Points "forward" — flip with `rtl:rotate-180`. */
export function ArrowIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2.4, props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Small colourful illustrations for the shop-by-age picker, keyed by age-group slug. */
export function AgeIcon({ slug, size = 30 }: { slug: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 32 32", "aria-hidden": true, strokeWidth: 1.6, stroke: "#1E2742" } as const;
  switch (slug) {
    case "0-6m": // pacifier
      return (
        <svg {...common} strokeLinejoin="round" strokeLinecap="round">
          <circle cx="16" cy="25" r="4" fill="none" />
          <path d="M6 17c0-3 4.5-5 10-5s10 2 10 5-4.5 4-10 4-10-1-10-4z" fill="#8FD3C1" />
          <path d="M12 12.5c0-4 1.8-8 4-8s4 4 4 8" fill="#FBC4C8" />
          <circle cx="16" cy="17" r="1.6" fill="#fff" />
        </svg>
      );
    case "6-12m": // bottle
      return (
        <svg {...common} strokeLinejoin="round">
          <path d="M13 3.5h6l1 4.5h-8z" fill="#F7A072" />
          <rect x="10" y="8" width="12" height="20.5" rx="4" fill="#FFF2C7" />
          <path d="M10 15h12" />
          <path d="M14 19h4M14 23h4" />
        </svg>
      );
    case "1-2y": // first steps (footprints)
      return (
        <svg {...common} strokeLinejoin="round">
          <ellipse cx="11" cy="20" rx="4" ry="6" fill="#A7C7F2" />
          <circle cx="8.5" cy="11.5" r="1.3" fill="#A7C7F2" />
          <circle cx="11.5" cy="11" r="1.3" fill="#A7C7F2" />
          <ellipse cx="21.5" cy="14" rx="4" ry="6" fill="#F7A9A0" />
          <circle cx="19" cy="5.5" r="1.3" fill="#F7A9A0" />
          <circle cx="22" cy="5" r="1.3" fill="#F7A9A0" />
        </svg>
      );
    case "2-4y": // tricycle
      return (
        <svg {...common} strokeLinejoin="round" strokeLinecap="round">
          <circle cx="8" cy="23" r="4.5" fill="#FFD449" />
          <circle cx="25" cy="24.5" r="3" fill="#FFD449" />
          <path d="M8 23l6-10h6l5 11.5M14 13l-2-4h-3M20 13l1-5h3" fill="none" />
          <path d="M12 9h4" />
        </svg>
      );
    case "4-6y": // bike
      return (
        <svg {...common} strokeLinejoin="round" strokeLinecap="round">
          <circle cx="8" cy="22" r="5" fill="#B9E4C9" />
          <circle cx="24" cy="22" r="5" fill="#B9E4C9" />
          <path d="M8 22l5-9h9l2 9M13 13l3 9h6M11 9h4M22 13l-1.5-4h3" fill="none" />
        </svg>
      );
    case "6-8y": // scooter
      return (
        <svg {...common} strokeLinejoin="round" strokeLinecap="round">
          <path d="M22 5h4M24 5l-3 19H8" fill="none" />
          <circle cx="7" cy="25" r="3" fill="#F7A9A0" />
          <circle cx="22" cy="25" r="3" fill="#F7A9A0" />
        </svg>
      );
    case "8-11y": // skateboard
      return (
        <svg {...common} strokeLinejoin="round" strokeLinecap="round">
          <path d="M3 15h26a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="#FFD449" />
          <circle cx="9" cy="22" r="2.5" fill="#A7C7F2" />
          <circle cx="23" cy="22" r="2.5" fill="#A7C7F2" />
        </svg>
      );
    case "teens": // headphones
      return (
        <svg {...common} strokeLinejoin="round" strokeLinecap="round">
          <path d="M6 20v-4a10 10 0 0 1 20 0v4" fill="none" />
          <rect x="4" y="18" width="6" height="9" rx="2" fill="#C9B6F2" />
          <rect x="22" y="18" width="6" height="9" rx="2" fill="#C9B6F2" />
        </svg>
      );
    case "adults": // dumbbell
      return (
        <svg {...common} strokeLinejoin="round" strokeLinecap="round">
          <path d="M10 16h12" />
          <rect x="5" y="9" width="5" height="14" rx="1.5" fill="#8FD3C1" />
          <rect x="22" y="9" width="5" height="14" rx="1.5" fill="#8FD3C1" />
          <path d="M3 13v6M29 13v6" />
        </svg>
      );
    default: // bike
      return (
        <svg {...common} strokeLinejoin="round" strokeLinecap="round">
          <circle cx="8" cy="22" r="5" fill="#B9E4C9" />
          <circle cx="24" cy="22" r="5" fill="#B9E4C9" />
          <path d="M8 22l5-9h9l2 9M13 13l3 9h6M11 9h4M22 13l-1.5-4h3" fill="none" />
        </svg>
      );
  }
}

// TODO(owner): replace with the real Doodlzz mascot artwork when available.
export function BearMascot({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden stroke="#1E2742" strokeWidth={1.6} strokeLinejoin="round">
      <ellipse cx="32" cy="60" rx="14" ry="2.5" fill="#EEF1F6" stroke="none" />
      <circle cx="17" cy="20" r="6" fill="#8CC8F0" />
      <circle cx="47" cy="20" r="6" fill="#8CC8F0" />
      <circle cx="17" cy="20" r="2.8" fill="#FCE7DE" stroke="none" />
      <circle cx="47" cy="20" r="2.8" fill="#FCE7DE" stroke="none" />
      <path d="M20 44c-2 6 2 13 12 13s14-7 12-13z" fill="#8CC8F0" />
      <ellipse cx="32" cy="50" rx="6" ry="5" fill="#fff" stroke="none" />
      <circle cx="32" cy="31" r="15" fill="#8CC8F0" />
      <ellipse cx="32" cy="36" rx="7" ry="5" fill="#fff" />
      <circle cx="26" cy="29" r="1.8" fill="#1E2742" stroke="none" />
      <circle cx="38" cy="29" r="1.8" fill="#1E2742" stroke="none" />
      <ellipse cx="32" cy="34" rx="2.2" ry="1.6" fill="#1E2742" stroke="none" />
      <path d="M30 37.5q2 1.6 4 0" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="34" r="2" fill="#F7A9A0" stroke="none" />
      <circle cx="42" cy="34" r="2" fill="#F7A9A0" stroke="none" />
      <path d="M22 18 32 2l10 16z" fill="#F25C54" />
      <circle cx="32" cy="2.5" r="2" fill="#FFD449" />
    </svg>
  );
}

/** WhatsApp logo shape (bubble with handset), filled with currentColor. */
export function WhatsAppMark({ size = 30, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/** Cash / card, for the "No Visa card needed" line. */
export function PaymentIcon({ size = 22, ...props }: IconProps) {
  return (
    <svg {...stroke(size, "0 0 24 24", 2, props)}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" />
    </svg>
  );
}
