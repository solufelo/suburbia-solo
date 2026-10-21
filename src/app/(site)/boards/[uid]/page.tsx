import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrismicNextImage } from "@prismicio/next";
import type { ImageField } from "@prismicio/client";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { HorizontalLine } from "@/components/Line";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/shop/ProductCard";
import { PurchasePanel } from "@/components/shop/PurchasePanel";
import { getProduct, getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { productJsonLd, productMetadata } from "@/lib/seo";

type Params = { params: Promise<{ uid: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ uid: p.uid }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProduct((await params).uid);
  if (!product) return { title: "Board not found", robots: { index: false } };
  return productMetadata(product);
}

export default async function ProductPage({ params }: Params) {
  const { uid } = await params;
  const product = await getProduct(uid);
  if (!product) notFound();

  const others = (await getProducts()).filter((p) => p.uid !== uid).slice(0, 4);

  return (
    <>
      <JsonLd data={productJsonLd(product)} />

      <section className="bg-texture relative overflow-hidden bg-brand-gray px-6 pb-16 ~pt-44/48 md:~pt-36/40">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <nav aria-label="Breadcrumb" className="text-sm lg:col-span-2">
            <ol className="flex flex-wrap items-center gap-2 text-zinc-500">
              <li>
                <Link href="/" className="hover:text-zinc-900 hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/boards" className="hover:text-zinc-900 hover:underline">
                  Boards
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-zinc-900">
                {product.name}
              </li>
            </ol>
          </nav>

          <figure className="group relative mx-auto flex aspect-[4/5] w-full max-w-md items-center justify-center lg:max-w-none">
            {/* Brush-stroke backdrop in the board's accent colour. */}
            <div
              aria-hidden="true"
              className="absolute inset-[4%] rotate-[4deg] opacity-90 [mask-image:url(/Images/paint-background.png)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
              style={{ backgroundColor: product.accent }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-[10%] -rotate-[8deg] bg-zinc-900 opacity-[0.07] [mask-image:url(/Images/paint-background.png)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
            />
            <PrismicNextImage
              // Prismic has no alt text on these images, so describe the board here.
              field={{ ...product.image, alt: product.image.alt || `${product.name} complete skateboard` } as ImageField}
              priority
              sizes="(min-width: 1024px) 220px, 40vw"
              className="relative h-[88%] w-auto -rotate-[10deg] drop-shadow-[18px_24px_0_rgba(0,0,0,0.18)] transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[-4deg]"
            />
            <span className="absolute right-[6%] top-[8%] grid size-24 rotate-12 place-items-center rounded-full bg-brand-lime text-center font-bowlby text-sm uppercase leading-tight ring-4 ring-black sm:size-28">
              Ready
              <br />
              to ride
            </span>
          </figure>

          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-purple">Complete skateboard</p>
            <Heading as="h1" size="lg" className="mt-3 leading-[0.9]">
              {product.name}
            </Heading>
            <p className="mt-5 font-bowlby text-4xl tabular-nums" data-testid="pdp-price">
              {formatPrice(product.price)}
            </p>

            <HorizontalLine className="my-6 h-2 w-full stroke-2 text-zinc-300" />

            <p className="max-w-prose text-lg leading-relaxed">{product.description}</p>

            <PurchasePanel product={product} />

            <HorizontalLine className="my-8 h-2 w-full stroke-2 text-zinc-300" />

            <h2 className="font-bowlby text-lg uppercase">What you get</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                `Deck with the ${product.name} graphic`,
                "Griptape, already applied",
                "Trucks, baseplates and bolts",
                "Four wheels, ready to roll",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-1.5 size-2.5 shrink-0 rotate-45" style={{ backgroundColor: product.accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {others.length > 0 ? (
        <Bounded className="bg-texture border-t-4 border-black bg-white">
          <Heading as="h2" size="md" className="mb-10 text-center">
            More boards
          </Heading>
          <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Bounded>
      ) : null}
    </>
  );
}
