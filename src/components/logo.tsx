/* eslint-disable @next/next/no-img-element -- static brand image, cropped with CSS */

// The logo file (524×435) has white space around the artwork; the artwork itself sits
// at roughly x 41–481, y 97–358. These numbers crop to it at any display height.
const FILE = { w: 524, h: 435 };
const ART = { x: 41, y: 97, w: 440, h: 261 };

/** Doodlzz logo for the nav bar, menu and admin panel. `height` is the visible height in px. */
export function Logo({ height = 46 }: { height?: number }) {
  const scale = height / ART.h;
  return (
    <span className="relative block flex-none overflow-hidden" style={{ width: Math.round(ART.w * scale), height }}>
      <img
        src="/brand/logo-doodles.jpg"
        alt="Doodlzz"
        width={FILE.w}
        height={FILE.h}
        className="absolute max-w-none"
        style={{ width: FILE.w * scale, height: FILE.h * scale, left: -ART.x * scale, top: -ART.y * scale }}
      />
    </span>
  );
}
