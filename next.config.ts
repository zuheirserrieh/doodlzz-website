import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site (HTML/JS in `out/`) — deployed to Cloudflare Pages.
  // The "/" → "/en" redirect lives in public/_redirects (Cloudflare reads it).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
