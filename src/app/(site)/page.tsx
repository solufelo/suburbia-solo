import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { asImageSrc, type Content } from "@prismicio/client";

import { createClient } from "@/lib/prismicio";
import { getProducts } from "@/lib/catalog";
import { StickySliceZone } from "@/components/StickySliceZone";

export default async function Page() {
  const client = createClient();
  const [page, products, skaters] = await Promise.all([
    client.getSingle("homepage").catch(() => notFound()),
    getProducts(),
    client.getAllByType<Content.SkaterDocument>("skater").catch(() => []),
  ]);

  return (
    <StickySliceZone
      slices={page.data.slices}
      context={{ products, skaters }}
      cascadeSpeed={0.08}
      preserveIntegrity={true}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const page = await client.getSingle("homepage").catch(() => notFound());
  const image = asImageSrc(page.data.meta_image);

  return {
    title: { absolute: page.data.meta_title || "Suburbia Skateboards" },
    description: page.data.meta_description ?? undefined,
    alternates: { canonical: "/" },
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}
