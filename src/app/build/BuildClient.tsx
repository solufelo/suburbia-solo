"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { FaArrowLeft, FaRandom, FaUndo } from "react-icons/fa";

import { BoardBuilder } from "@/components/BoardBuilder";
import { Button } from "@/components/ButtonLink";
import { CanvasBoundary } from "@/components/CanvasBoundary";
import { Logo } from "@/components/Logo";
import { CartButton } from "@/components/cart/CartButton";
import { useCart } from "@/contexts/CartContext";
import { useSkateboard } from "@/contexts/SkateboardContext";
import {
  CUSTOM_BOARD_PRICE_CENTS,
  describeDesign,
  randomDesign,
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
    <div className="on-dark flex h-dvh flex-col overflow-hidden bg-zinc-950 text-white lg:grid lg:grid-cols-[1fr_minmax(24rem,31rem)]">
      {/* ---------- Stage ---------- */}
      <section
        aria-label="3D preview of your board"
        className="relative h-[52svh] shrink-0 bg-[#2b2829] lg:h-full"
      >
        <div className="absolute inset-0">
          <CanvasBoundary fallback={<StaticPreview design={design} />}>
            <Preview />
          </CanvasBoundary>
        </div>
        <SceneLoader />
        <RegistrationMarks />

        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6">
          <div className="pointer-events-auto flex items-center gap-4">
            <Link href="/" aria-label="Suburbia Skate home" className="transition-transform duration-300 ease-slap hover:-rotate-3">
              <Logo className="h-11 w-auto text-paper sm:h-14" />
            </Link>
            <Link
              href="/boards"
              className="hidden min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/70 hover:text-brand-lime sm:flex"
            >
              <FaArrowLeft aria-hidden="true" className="size-3" /> Shop
            </Link>
          </div>
          <div className="pointer-events-auto lg:hidden">
            <CartButton tone="lime" />
          </div>
        </header>

        <dl className="pointer-events-none absolute bottom-4 left-4 z-10 hidden font-mono text-[0.68rem] uppercase leading-relaxed tracking-widest text-white/60 sm:bottom-6 sm:left-6 lg:block">
          {[
            ["Deck", r.deck.name],
            ["Wheels", r.wheel.name],
            ["Trucks", r.truck.name],
            ["Bolts", r.bolt.name],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-16 text-white/35">{k}</dt>
              <dd key={v} className="anim-fade-up text-white [--d:0s]">
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <div className="pointer-events-none absolute inset-x-4 bottom-3 z-10 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6 lg:left-auto">
          <h1 className="font-display text-[1.9rem] uppercase leading-none lg:hidden">
            Build your <span className="text-brand-lime">board</span>
          </h1>
          <p className="text-right font-mono text-[0.62rem] uppercase leading-relaxed tracking-widest text-white/45">
            Drag to spin
            <br className="sm:hidden" />
            <span className="max-sm:hidden"> · </span>Pinch to zoom
          </p>
        </div>
      </section>

      {/* ---------- Controls ---------- */}
      <section className="bg-texture flex min-h-0 grow flex-col bg-zinc-900 lg:h-full lg:border-l-2 lg:border-black">
        <div className="hidden items-center justify-between px-8 pt-6 lg:flex">
          <p className="kicker text-brand-lime">Custom complete</p>
          <CartButton tone="lime" />
        </div>

        <div className="flex min-h-0 grow flex-col lg:block lg:overflow-y-auto lg:px-8 lg:pb-8 lg:pt-3">
          <div className="hidden lg:block">
            <h1 className="font-display text-[clamp(2.4rem,3.4vw,3.25rem)] uppercase leading-[0.9]">
              Build your <span className="riso [--riso:#ff4fa3]">board</span>
            </h1>
            <p className="mt-2 max-w-[40ch] text-[0.9rem] leading-relaxed text-white/60">
              Pick a graphic, then wheels and hardware. The board updates as you go.
            </p>
            <div aria-hidden="true" className="my-6 h-px bg-white/15" />
          </div>
          <BoardBuilder
            mobileFooter={
              <button
                type="button"
                onClick={resetDesign}
                className="flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/60"
              >
                <FaUndo aria-hidden="true" className="size-3" /> Start over
              </button>
            }
          />
          <div className="mt-7 hidden gap-3 lg:flex">
            <ToolButton onClick={() => updateDesign(randomDesign(Math.random, design))} icon={<FaRandom />}>
              Shuffle
            </ToolButton>
            <ToolButton onClick={resetDesign} icon={<FaUndo />}>
              Start over
            </ToolButton>
          </div>
        </div>

        <footer className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-t-2 border-black bg-zinc-950 px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => updateDesign(randomDesign(Math.random, design))}
              aria-label="Shuffle: random design"
              className="grid size-11 shrink-0 place-items-center border-2 border-white/25 text-brand-lime transition-transform duration-300 ease-slap hover:rotate-12 active:scale-90 lg:hidden"
            >
              <FaRandom aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-mono text-[0.68rem] uppercase tracking-widest text-white/50" title={describeDesign(design)}>
                <span className="sm:hidden">{r.deck.name}</span>
                <span className="max-sm:hidden">{r.deck.name} · {r.wheel.name}</span>
              </p>
              <p className="font-display text-[2rem] leading-none tabular-nums" data-testid="build-price">
                {formatPrice(CUSTOM_BOARD_PRICE_CENTS)}
              </p>
            </div>
          </div>
          <Button
            icon="cart"
            color={added ? "lime" : "orange"}
            onClick={addToCart}
            data-testid="build-add"
            className="!mr-3 shrink-0"
          >
            <span aria-live="polite">{added ? "Added!" : "Add to cart"}</span>
          </Button>
        </footer>
      </section>
    </div>
  );
}

function ToolButton({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-11 items-center gap-2.5 border-2 border-white/20 px-4 font-mono text-xs font-medium uppercase tracking-widest text-white/80 transition-[border-color,color,transform] duration-200 hover:border-brand-lime hover:text-brand-lime active:translate-y-px"
    >
      <span aria-hidden="true" className="transition-transform duration-300 ease-slap group-hover:-rotate-12">
        {icon}
      </span>
      {children}
    </button>
  );
}

/** Print registration marks in the corners of the stage. */
function RegistrationMarks() {
  const mark = (
    <svg viewBox="0 0 24 24" className="size-5 text-white/30" aria-hidden="true">
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-3 z-[5] hidden sm:block">
      <span className="absolute right-0 top-[18%]">{mark}</span>
      <span className="absolute bottom-[18%] left-0">{mark}</span>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2">{mark}</span>
    </div>
  );
}

/** Progress while the model and every texture load (first visit only). */
function SceneLoader() {
  const { active, progress } = useProgress();
  // Stay mounted briefly after loading ends so the overlay can fade out.
  const [lingering, setLingering] = useState(false);
  useEffect(() => {
    if (active) {
      setLingering(true);
      return;
    }
    const t = window.setTimeout(() => setLingering(false), 500);
    return () => window.clearTimeout(t);
  }, [active]);
  if (!active && !lingering) return null;
  const pct = Math.round(progress);
  return (
    <div
      className={clsx(
        "absolute inset-0 z-10 grid place-items-center bg-[#2b2829] transition-opacity duration-500",
        active ? "opacity-100" : "opacity-0",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="w-56 text-center">
        <svg viewBox="0 0 48 48" className="anim-spin mx-auto size-14 text-brand-lime" aria-hidden="true">
          <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="5" />
          <circle cx="24" cy="24" r="7" fill="currentColor" />
          {[0, 72, 144, 216, 288].map((a) => (
            <rect key={a} x="22.5" y="6" width="3" height="10" fill="currentColor" transform={`rotate(${a} 24 24)`} />
          ))}
        </svg>
        <p className="font-display mt-4 text-[1.7rem] uppercase leading-none">Waxing the deck</p>
        <div className="mt-3 h-2.5 border-2 border-white/70">
          <div className="h-full bg-brand-lime transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 font-mono text-xs tabular-nums text-white/60">{pct}%</p>
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
