import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the e2e suite build into its own folder while `npm run dev` keeps .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
