/** Public origin used for canonical URLs, Open Graph images and the sitemap. */
export function siteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL || // set by Netlify at build time
    `http://localhost:${process.env.PORT || 3000}`;
  return url.replace(/\/$/, "");
}

export const SITE_NAME = "Suburbia Skateboards";

/**
 * Header and footer links. Owned by code rather than Prismic because the
 * Prismic navigation pointed "Team" and "About" at "/" (nowhere).
 */
export const NAV = [
  { href: "/boards", label: "Shop", note: "Completes" },
  { href: "/build", label: "Build", note: "3D builder" },
  { href: "/#team", label: "Team", note: "Who rides" },
  { href: "/#story", label: "Story", note: "Why Suburbia" },
] as const;
