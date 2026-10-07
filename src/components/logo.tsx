/* eslint-disable @next/next/no-img-element -- static brand image, cropped with CSS */

// The logo file (1280×799) has white space around the artwork; the artwork itself sits
// at roughly x 30–1225, y 110–660. These numbers crop to it at any display height.
const FILE = { w: 1280, h: 799 };
const ART = { x: 30, y: 110, w: 1195, h: 550 };

/** Doodlzz logo for the nav bar, menu and admin panel. `height` is the visible height in px. */
export function Logo({ height = 46 }: { height?: number }) {
  const scale = height / ART.h;
  return (
    <span className="relative block flex-none overflow-hidden" style={{ width: Math.round(ART.w * scale), height }}>
      <img
        src="/brand/logo-doodlzz.jpg"
        alt="Doodlzz"
        width={FILE.w}
        height={FILE.h}
        className="absolute max-w-none"
        style={{ width: FILE.w * scale, height: FILE.h * scale, left: -ART.x * scale, top: -ART.y * scale }}
      />
    </span>
  );
}
