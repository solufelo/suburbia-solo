import type { MetadataRoute } from "next";

import { getProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts().catch(() => []);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/boards`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/build`, changeFrequency: "monthly", priority: 0.8 },
    ...products.map((p) => ({
      url: `${base}${p.href}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
