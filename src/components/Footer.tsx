import Image from "next/image";
import Link from "next/link";
import { asImageSrc } from "@prismicio/client";

import { Logo } from "@/components/Logo";
import { MarkerNote, Marquee } from "@/components/zine";
import { getProducts } from "@/lib/catalog";
import { NAV } from "@/lib/site";
import { FooterPhysics } from "./FooterPhysics";
import { BackToTop } from "./BackToTop";

export async function Footer() {
  const products = await getProducts().catch(() => []);
  const boardTextureURLs = products
    .map((p) => asImageSrc(p.image, { h: 600 }))
    .filter((url): url is string => Boolean(url))
    .slice(0, 8);

  return (
    <footer className="on-dark relative overflow-hidden bg-ink text-paper">
      <Marquee
        items={["Escape the cul-de-sac", "Grab a board and throw it", "Built in the burbs", "No two builds alike"]}
        className="border-y-2 border-ink bg-brand-hot py-2.5 font-display text-[1.6rem] uppercase leading-none text-ink"
        speed={30}
      />

      <div className="relative h-[62vh] min-h-[26rem] overflow-hidden">
        <Image
          src="/Images/web/pexels-artempodrez-4816744.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[50%_30%] saturate-[0.85]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
        <FooterPhysics boardTextureURLs={boardTextureURLs} className="absolute inset-0 z-10 overflow-hidden" />
        <div className="wrap pointer-events-none relative z-20 flex h-full flex-col justify-between py-8">
          <Logo className="h-16 w-auto self-start text-paper mix-blend-difference md:h-24" />
          {/* Ink scrap behind the note: boards pile up under it, never through it. */}
          <MarkerNote className="max-w-[14ch] -rotate-6 self-end bg-ink px-3 py-1.5 text-2xl text-brand-lime shadow-[4px_4px_0_#ff4fa3] md:text-3xl">
            Grab a board. Throw it.
          </MarkerNote>
        </div>
      </div>

      <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:gap-8 md:py-20">
        <div className="md:col-span-5">
          <p className="font-display t-lg uppercase">
            Escape the
            <br />
            <span className="text-brand-lime">cul-de-sac.</span>
          </p>
          <p className="mt-6 max-w-sm text-white/70">
            Completes and custom builds from a skate shop that only exists on this page.
          </p>
        </div>

        <nav aria-label="Boards" className="md:col-span-3 md:col-start-7">
          <p className="kicker text-white/50">Completes</p>
          <ul className="mt-4 space-y-2">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={p.href} className="link-hl [--hl:#ff4fa3] text-lg">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer" className="md:col-span-2">
          <p className="kicker text-white/50">Site</p>
          <ul className="mt-4 space-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-hl [--hl:#ff4fa3] text-lg">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/checkout" className="link-hl [--hl:#ff4fa3] text-lg">
                Checkout
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/15">
        <div className="wrap flex flex-col gap-4 py-6 font-mono text-[0.72rem] uppercase tracking-widest text-white/55 md:flex-row md:items-center md:justify-between">
          <p>Suburbia Skate is a fictional brand. Demo shop: nothing is charged or shipped.</p>
          <div className="flex items-center gap-6">
            <p>Built by Solomon Olufelo</p>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
