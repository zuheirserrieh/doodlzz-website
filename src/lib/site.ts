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
