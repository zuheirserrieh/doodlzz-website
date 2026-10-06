import { Baloo_Bhaijaan_2, Fredoka, Outfit, Plus_Jakarta_Sans } from "next/font/google";

// One font for the whole site (headings and text). Two candidates while the owner
// chooses: A is the default, B is previewed with ?font=b (see FontPreviewScript).
export const fontA = Plus_Jakarta_Sans({ variable: "--font-a", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
export const fontB = Outfit({ variable: "--font-b", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
// Arabic: rounded, playful style that matches the bubbly logo.
export const fontArabic = Baloo_Bhaijaan_2({ variable: "--font-arabic", subsets: ["arabic"], weight: ["400", "500", "600", "700", "800"] });
// Used only for the "Doodlzz" wordmark in the header and menu.
export const fontLogo = Fredoka({ variable: "--font-logo", subsets: ["latin"], weight: "600" });

export const fontVariables = [fontA, fontB, fontArabic, fontLogo].map((f) => f.variable).join(" ");

/**
 * Lets the owner compare the two fonts on the live site: open any page with ?font=b
 * (or ?font=a to go back). The choice is remembered while browsing.
 */
export const fontPreviewScript = `try{var m=location.search.match(/[?&]font=(a|b)/);if(m)localStorage.setItem("dz-font",m[1]);var f=localStorage.getItem("dz-font");if(f==="b")document.documentElement.setAttribute("data-font","b")}catch(e){}`;
