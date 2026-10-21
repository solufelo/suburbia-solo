import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { PrismicNextImage } from "@prismicio/next";
import type { ImageField } from "@prismicio/client";

import { Heading, Kicker } from "@/components/Heading";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { Sticker } from "@/components/zine";
import { ProductCard } from "@/components/shop/ProductCard";
import { PurchasePanel } from "@/components/shop/PurchasePanel";
import { getProduct, getProducts } from "@/lib/catalog";
import { findDeck } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import { productJsonLd, productMetadata } from "@/lib/seo";
import { COMPLETE_SPECS } from "@/lib/site";

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

const { deck: D, grip, trucks, wheels } = COMPLETE_SPECS;
const SPECS = (name: string) => [
  ["Deck", `${name} graphic, ${D.plies}-ply ${D.wood}, ${D.size}`],
  ["Grip", grip],
  ["Trucks", `${trucks.mm} mm, ${trucks.note}`],
  ["Wheels", `${wheels.mm} mm, ${wheels.duro}, ${wheels.note}`],
];

export default async function ProductPage({ params }: Params) {
  const { uid } = await params;
  const product = await getProduct(uid);
  if (!product) notFound();

  const all = await getProducts();
  const others = all.filter((p) => p.uid !== uid).slice(0, 4);
  const index = Math.max(0, all.findIndex((p) => p.uid === uid));
  const deck = product.deck ? findDeck(product.deck) : undefined;

  return (
    <>
      <JsonLd data={productJsonLd(product)} />

      <section className="bg-texture page-top relative overflow-hidden bg-paper pb-[clamp(3rem,7vw,6rem)]">
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="anim-fade-up font-mono text-xs uppercase tracking-widest">
            <ol className="flex flex-wrap items-center gap-2 text-ink/55">
              <li>
                <Link href="/" className="link-hl">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/boards" className="link-hl">
                  Boards
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-6 grid items-start gap-x-12 gap-y-10 lg:mt-10 lg:grid-cols-12">
            <figure
              className="group relative mx-auto aspect-[5/6] w-full max-w-lg lg:sticky lg:top-24 lg:col-span-6 lg:max-w-none"
              style={{ "--accent": product.accent } as CSSProperties}
            >
              <div
                aria-hidden="true"
                className="absolute inset-[3%_2%] rotate-[3deg] bg-[var(--accent)] [mask-image:url(/Images/web/paint-background.webp)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%]"
              />
              <div
                aria-hidden="true"
                className="halftone absolute inset-[10%_8%] -rotate-[6deg] text-ink/20 [mask-image:url(/Images/web/paint-background.webp)] [mask-size:100%_100%]"
              />
              <span aria-hidden="true" className="tape left-[38%] top-[2%] rotate-[-8deg]" />
              <div className="anim-fade-up absolute inset-0 flex items-center justify-center [--d:0.1s]">
                <PrismicNextImage
                  // Prismic has no alt text on these images, so describe the board here.
                  field={{ ...product.image, alt: product.image.alt || `${product.name} complete skateboard` } as ImageField}
                  priority
                  sizes="(min-width: 1024px) 300px, 50vw"
                  className="relative h-[90%] w-auto -rotate-[9deg] drop-shadow-[18px_24px_0_rgba(21,19,20,0.22)] transition-transform duration-700 ease-snap group-hover:-translate-y-2 group-hover:rotate-[-3deg]"
                />
              </div>
              {deck ? (
                <div
                  aria-hidden="true"
                  className="anim-slap absolute bottom-[5%] left-[3%] w-[17%] min-w-20 bg-white p-1.5 pb-7 shadow-[5px_6px_0_rgba(21,19,20,0.6)] [--d:0.6s] [--r:-8deg]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={deck.thumb} alt="" width={160} height={632} className="mx-auto h-auto w-[36%]" />
                  <span className="absolute inset-x-0 bottom-1.5 text-center font-marker text-[0.8rem]">the graphic</span>
                </div>
              ) : null}
              <Sticker
                shape="star"
                color="lime"
                rotate={12}
                animate
                delay={0.45}
                className="absolute right-[2%] top-[6%] size-28 text-[1.3rem] sm:size-32 sm:text-[1.5rem]"
              >
                Ready
                <br />
                to ride
              </Sticker>
            </figure>

            <div className="lg:col-span-5 lg:col-start-8 lg:pt-6">
              <Kicker index={`No.${String(index + 1).padStart(2, "0")}`} className="anim-fade-up">
                Complete skateboard
              </Kicker>
              <h1 className="font-display t-xl mt-4 uppercase">
                <span className="block overflow-hidden pb-[0.04em]">
                  <span className="anim-rise block [--d:0.05s]">{product.name}</span>
                </span>
              </h1>
              <div className="anim-fade-up mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 [--d:0.2s]">
                <p className="font-display text-[3rem] leading-none tabular-nums" data-testid="pdp-price">
                  {formatPrice(product.price)}
                </p>
                <p className="font-mono text-xs uppercase tracking-widest text-ink/55">Assembled · ready to roll</p>
              </div>

              <p className="anim-fade-up lede mt-6 max-w-[44ch] [--d:0.3s]">{product.description}</p>

              <div className="anim-fade-up [--d:0.4s]">
                <PurchasePanel product={product} />
              </div>

              <div className="anim-fade-up mt-10 [--d:0.5s]">
                <h2 className="kicker">In the box</h2>
                <dl className="mt-3 border-t-2 border-ink font-mono text-sm">
                  {SPECS(product.name).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[6rem_1fr] gap-3 border-b border-dashed border-ink/30 py-3">
                      <dt className="uppercase tracking-widest text-ink/55">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="bg-texture border-t-2 border-ink bg-kraft py-[clamp(4rem,8vw,7rem)]">
          <div className="wrap">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <Kicker index="+">Keep looking</Kicker>
                <Heading as="h2" size="lg" className="mt-3">
                  More boards
                </Heading>
              </div>
              <Link href="/boards" className="font-display link-hl text-[1.5rem] uppercase">
                See the rack
              </Link>
            </div>
            <div
              className={`grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-8 ${others.length === 3 ? "lg:grid-cols-3 lg:gap-x-16" : "lg:grid-cols-4"}`}
            >
              {others.map((p) => (
                <Reveal key={p.id}>
                  <ProductCard product={p} index={all.findIndex((x) => x.uid === p.uid)} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
