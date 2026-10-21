import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses, ButtonIcon } from "@/components/ButtonLink";
import { Heading } from "@/components/Heading";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop complete skateboards",
  description:
    "Every Suburbia complete in one place: pick a graphic, add it to your cart, or open it in the 3D builder and make it yours.",
  alternates: { canonical: "/boards" },
};

export default async function BoardsPage() {
  const products = await getProducts();
  const base = siteUrl();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${base}${p.href}`,
            name: p.name,
          })),
        }}
      />
      <section className="bg-texture bg-brand-gray px-6 pb-20 ~pt-44/48 md:~pt-36/40">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand-purple">
                {products.length} completes
              </p>
              <Heading as="h1" size="lg" className="mt-2 leading-[0.9]">
                All boards
              </Heading>
            </div>
            <p className="max-w-sm text-zinc-600">
              Every board here is a complete. Tap one for details, or open it in the builder to swap wheels and hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 4} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-texture relative overflow-hidden bg-brand-lime px-6 py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Heading as="h2" size="md" className="max-w-xl leading-[0.95]">
            None of these quite you?
          </Heading>
          <Link href="/build" className={buttonClasses({ color: "purple", size: "lg" })}>
            <ButtonIcon icon="skateboard" size="lg" />
            Build your own
          </Link>
        </div>
      </section>
    </>
  );
}
