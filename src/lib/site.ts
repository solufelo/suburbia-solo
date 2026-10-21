/** Public origin used for canonical URLs, Open Graph images and the sitemap. */
export function siteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL || // set by Netlify at build time
    `http://localhost:${process.env.PORT || 3000}`;
  return url.replace(/\/$/, "");
}

export const SITE_NAME = "Suburbia Skateboards";
