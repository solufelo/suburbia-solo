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
 * Fictional but realistic parts list shared by every complete (and every
 * custom build). The product page's "In the box" and the homepage spec panel
 * both read it, so the numbers can't drift apart.
 */
export const COMPLETE_SPECS = {
  deck: { plies: 7, wood: "maple", size: "8.0″ × 31.75″" },
  grip: "Black, already applied",
  trucks: { mm: 139, note: "baseplates and bolts" },
  wheels: { mm: 53, duro: "99A", note: "bearings fitted" },
} as const;

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
