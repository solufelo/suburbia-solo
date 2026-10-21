import type { Metadata } from "next";
import Link from "next/link";

import { buttonClasses, ButtonIcon } from "@/components/ButtonLink";
import { Heading, Kicker } from "@/components/Heading";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { DeckFan } from "@/components/shop/DeckFan";
import { ProductCard } from "@/components/shop/ProductCard";
import { MarkerNote, RansomWord } from "@/components/zine";
import { getProducts } from "@/lib/catalog";
import { CUSTOM_BOARD_PRICE_CENTS, DECKS, METALS, WHEELS } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
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
      <section className="bg-texture page-top relative overflow-hidden bg-paper pb-[clamp(4rem,8vw,7rem)]">
        <div className="wrap">
          <div className="grid items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <Kicker index={String(products.length).padStart(2, "0")} className="anim-fade-up">
                Completes in stock
              </Kicker>
              <h1 className="font-display t-mega mt-4 flex flex-wrap items-end gap-x-[0.18em] uppercase">
                <span className="inline-block overflow-hidden pb-[0.04em]">
                  <span className="anim-rise block">The</span>
                </span>{" "}
                <RansomWord word="Rack" animate baseDelay={0.25} className="mb-[0.06em] text-[0.82em]" />
              </h1>
            </div>
            <div className="anim-fade-up md:col-span-4 md:pb-4 [--d:0.5s]">
              <p className="lede max-w-[34ch] text-ink/80">
                Every board here is a complete: deck, grip, trucks and wheels, put together and ready to roll.
                Want different wheels? Open it in the builder.
              </p>
              <MarkerNote className="mt-4 inline-block -rotate-3 text-2xl text-brand-hot">pick one. go skate.</MarkerNote>
            </div>
          </div>

          <div className="mt-[clamp(3rem,6vw,5rem)] grid grid-cols-2 gap-x-5 gap-y-14 md:gap-x-8 lg:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.08}>
                <ProductCard product={product} priority={i < 4} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-texture relative overflow-hidden border-t-2 border-ink bg-brand-lime py-[clamp(4rem,8vw,7rem)]">
        <div className="wrap grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <Reveal>
              <Kicker index="3D">
                {DECKS.length} graphics · {WHEELS.length} wheels · {METALS.length} finishes
              </Kicker>
            </Reveal>
            <Reveal variant="mask" delay={0.05}>
              <Heading as="h2" size="xl" className="mt-4">
                None of these <span className="riso [--riso:#ff4fa3]">quite you?</span>
              </Heading>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="lede mt-6 max-w-[36ch]">
                Build your own complete in 3D. {formatPrice(CUSTOM_BOARD_PRICE_CENTS)} flat, every part your call.
              </p>
            </Reveal>
            <Reveal delay={0.22} className="mt-8">
              <Link href="/build" className={buttonClasses({ color: "purple", size: "lg" })}>
                <ButtonIcon icon="skateboard" size="lg" />
                Build your own
              </Link>
            </Reveal>
          </div>
          <Reveal className="md:col-span-6" delay={0.1}>
            <DeckFan className="mx-auto max-w-xl" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
