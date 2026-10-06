/**
 * Store-wide settings. Values marked TODO are placeholders waiting on the owner.
 */
export const site = {
  name: "Doodlzz",
  // WhatsApp number: international format, digits only (961 = Lebanon).
  whatsappNumber: "96181727746",
  // Phone shown in "Get in touch" (as displayed) and as dialled.
  phoneDisplay: "+961 81 727 746",
  phoneTel: "+96181727746",
  email: "doodlzzlb@gmail.com",
  social: {
    handle: "@doodlzz.lb",
    instagram: "https://www.instagram.com/doodlzz.lb",
    facebook: "https://www.facebook.com/share/1EyNdhXWb4/",
    tiktok: "https://www.tiktok.com/@doodlzz4",
  },
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
