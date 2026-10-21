"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

import { BoardBuilder } from "@/components/BoardBuilder";
import { Button } from "@/components/ButtonLink";
import { CanvasBoundary } from "@/components/CanvasBoundary";
import { Heading } from "@/components/Heading";
import { Logo } from "@/components/Logo";
import { CartButton } from "@/components/cart/CartButton";
import { useCart } from "@/contexts/CartContext";
import { useSkateboard } from "@/contexts/SkateboardContext";
import {
  CUSTOM_BOARD_PRICE_CENTS,
  describeDesign,
  resolveDesign,
  type BoardDesign,
} from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import Preview from "./Preview";

export function BuildClient({ preset }: { preset: Partial<BoardDesign> }) {
  const { design, updateDesign, resetDesign } = useSkateboard();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const r = resolveDesign(design);

  const presetKey = JSON.stringify(preset);
  useEffect(() => {
    const p = JSON.parse(presetKey) as Partial<BoardDesign>;
    if (Object.keys(p).length > 0) updateDesign(p);
  }, [presetKey, updateDesign]);

  function addToCart() {
    add({
      kind: "custom",
      design,
      name: `Custom ${r.deck.name}`,
      unitPrice: CUSTOM_BOARD_PRICE_CENTS,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-900 lg:grid lg:h-dvh lg:grid-cols-[1fr_minmax(22rem,30rem)] lg:overflow-hidden">
      <section
        aria-label="3D preview of your board"
        className="relative aspect-square shrink-0 bg-[#3a414a] sm:aspect-[4/3] lg:aspect-auto lg:h-full"
      >
        <div className="absolute inset-0">
          <CanvasBoundary fallback={<StaticPreview design={design} />}>
            <Preview />
          </CanvasBoundary>
        </div>
        <SceneLoader />

        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4 sm:p-6">
          <Link href="/" className="pointer-events-auto" aria-label="Back to the Suburbia homepage">
            <Logo className="h-12 text-white drop-shadow sm:h-16" />
          </Link>
          <div className="pointer-events-auto lg:hidden">
            <CartButton />
          </div>
        </header>

        <p className="pointer-events-none absolute bottom-4 left-4 z-10 bg-black/40 px-2 py-1 text-xs text-white/80 sm:bottom-6 sm:left-6">
          Drag to spin · scroll or pinch to zoom
        </p>
      </section>

      <section className="bg-texture flex flex-col bg-zinc-900 text-white lg:h-full lg:min-h-0">
        <div className="hidden justify-end px-6 pt-6 lg:flex">
          <CartButton />
        </div>

        <div className="grow px-6 pb-8 pt-8 lg:min-h-0 lg:overflow-y-auto lg:pt-4">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-lime">Custom complete</p>
          <Heading as="h1" size="sm" className="mt-2 leading-none">
            Build your board
          </Heading>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-400">
            Pick a graphic, then dial in the wheels and hardware. The 3D preview updates as you go.
          </p>
          <div className="mt-8">
            <BoardBuilder />
          </div>
          <button
            type="button"
            onClick={resetDesign}
            className="mt-8 text-sm text-zinc-400 underline underline-offset-4 hover:text-white"
          >
            Start over
          </button>
        </div>

        <footer className="sticky bottom-0 z-20 flex items-center justify-between gap-4 border-t-2 border-black bg-zinc-950/95 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate text-xs text-zinc-400" title={describeDesign(design)}>
              {r.deck.name} · {r.wheel.name} wheels
            </p>
            <p className="font-bowlby text-2xl tabular-nums" data-testid="build-price">
              {formatPrice(CUSTOM_BOARD_PRICE_CENTS)}
            </p>
          </div>
          <Button icon="cart" onClick={addToCart} data-testid="build-add" className="shrink-0">
            <span aria-live="polite">{added ? "Added!" : "Add to cart"}</span>
          </Button>
        </footer>
      </section>
    </div>
  );
}

/** Progress while the model and every texture load (first visit only). */
function SceneLoader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center" role="status">
      <div className="w-48 text-center text-white">
        <p className="font-bowlby text-lg uppercase">Waxing the deck…</p>
        <div className="mt-3 h-2 border border-white/60">
          <div className="h-full bg-brand-lime transition-[width]" style={{ width: `${Math.round(progress)}%` }} />
        </div>
      </div>
    </div>
  );
}

/** Shown instead of the 3D preview when WebGL is not available. */
function StaticPreview({ design }: { design: BoardDesign }) {
  const r = resolveDesign(design);
  return (
    <div className="flex h-full items-center justify-center gap-8 p-10">
      <img src={r.deck.thumb} alt={`${r.deck.name} deck`} className="h-[80%] w-auto -rotate-12 drop-shadow-2xl" />
      <div className="flex flex-col gap-3 text-sm text-white">
        <span className="flex items-center gap-2">
          <img src={r.wheel.texture} alt="" className="size-8 rounded-full" /> {r.wheel.name} wheels
        </span>
        <span className="flex items-center gap-2">
          <span className="size-8 rounded-full" style={{ background: r.truck.color }} /> {r.truck.name} trucks
        </span>
        <span className="flex items-center gap-2">
          <span className="size-8 rounded-full" style={{ background: r.bolt.color }} /> {r.bolt.name} bolts
        </span>
      </div>
    </div>
  );
}
