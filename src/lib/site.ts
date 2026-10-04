/**
 * Store-wide settings. Values marked TODO are placeholders waiting on the owner.
 */
export const site = {
  name: "Doodlzz",
  // TODO(owner): real WhatsApp number, international format, digits only (961 = Lebanon).
  whatsappNumber: "96100000000",
  // TODO(owner): confirm the USD → LBP rate to display.
  lbpPerUsd: 89_500,
  social: {
    // TODO(owner): real handles.
    handle: "@doodlzz",
    instagram: "https://instagram.com/doodlzz",
    facebook: "https://facebook.com/doodlzz",
    tiktok: "https://tiktok.com/@doodlzz",
  },
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
