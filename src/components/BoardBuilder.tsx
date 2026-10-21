"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import clsx from "clsx";

import { useSkateboard } from "@/contexts/SkateboardContext";
import { DECKS, METALS, WHEELS, type BoardDesign } from "@/lib/customizer-options";

type Part = keyof BoardDesign;

const PARTS: { key: Part; label: string }[] = [
  { key: "deck", label: "Deck" },
  { key: "wheel", label: "Wheels" },
  { key: "truck", label: "Trucks" },
  { key: "bolt", label: "Bolts" },
];

function currentName(part: Part, design: BoardDesign) {
  if (part === "deck") return DECKS.find((d) => d.id === design.deck)?.name;
  if (part === "wheel") return WHEELS.find((w) => w.id === design.wheel)?.name;
  return METALS.find((m) => m.id === design[part])?.name;
}

/**
 * Option pickers for the board builder. Each group is a native radio group, so
 * arrow keys, Tab and screen readers behave as expected; the styling sits on
 * the label.
 *
 * Phones get one group at a time behind a tab row, as a swipeable rail of big
 * targets, so the whole builder fits on one screen under the 3D preview.
 * Desktop shows every group at once.
 */
export function BoardBuilder({ mobileFooter }: { mobileFooter?: React.ReactNode }) {
  const { design, updateDesign } = useSkateboard();
  const [active, setActive] = useState<Part>("deck");
  const set = (key: Part) => (e: React.ChangeEvent<HTMLInputElement>) => updateDesign({ [key]: e.target.value });

  return (
    <div className="flex min-h-0 flex-col lg:block">
      <div
        role="tablist"
        aria-label="Board parts"
        className="grid shrink-0 grid-cols-4 border-y-2 border-black bg-zinc-950 lg:hidden"
      >
        {PARTS.map((p, i) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            id={`tab-${p.key}`}
            aria-selected={active === p.key}
            aria-controls={`group-${p.key}`}
            onClick={() => setActive(p.key)}
            className={clsx(
              "relative flex min-h-14 flex-col items-start justify-center gap-0.5 px-3 text-left transition-colors duration-200",
              i > 0 && "border-l border-white/10",
              active === p.key ? "bg-brand-lime text-ink" : "text-white hover:bg-white/5",
            )}
          >
            <span className="font-display text-[1.2rem] uppercase leading-none">{p.label}</span>
            <span
              className={clsx(
                "w-full truncate font-mono text-[0.6rem] uppercase tracking-wider",
                active === p.key ? "text-ink/70" : "text-white/50",
              )}
            >
              {currentName(p.key, design)}
            </span>
          </button>
        ))}
      </div>

      <div className="min-h-0 grow overflow-y-auto px-5 py-5 lg:space-y-7 lg:overflow-visible lg:p-0">
        <OptionGroup part="deck" index={1} active={active} current={currentName("deck", design)}>
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-4 pt-3 max-lg:[mask-image:linear-gradient(90deg,transparent,#000_1rem,#000_calc(100%_-_3rem),transparent)] lg:mx-0 lg:grid lg:grid-cols-11 lg:gap-1.5 lg:overflow-visible lg:p-0 lg:pt-3">
            {DECKS.map((deck) => (
              <label
                key={deck.id}
                className="group relative w-14 shrink-0 cursor-pointer snap-start pb-3 lg:w-auto"
                title={deck.name}
              >
                <input
                  type="radio"
                  name="deck"
                  value={deck.id}
                  checked={design.deck === deck.id}
                  onChange={set("deck")}
                  className="peer sr-only"
                />
                <span className="sr-only">{deck.name}</span>
                <img
                  src={deck.thumb}
                  alt=""
                  width={160}
                  height={632}
                  loading="lazy"
                  className="mx-auto h-36 w-auto transition duration-300 ease-snap group-hover:-translate-y-1 group-hover:-rotate-3 peer-checked:-translate-y-2 peer-checked:rotate-[-4deg] peer-checked:drop-shadow-[5px_7px_0_#d9f154] lg:h-auto lg:w-full"
                />
                <span className="pointer-events-none absolute inset-x-2 bottom-0 h-1 bg-transparent transition peer-checked:bg-brand-lime" />
                <span className="pointer-events-none absolute -inset-1 rounded-md ring-2 ring-transparent transition peer-focus-visible:ring-brand-lime" />
              </label>
            ))}
          </div>
        </OptionGroup>

        <OptionGroup part="wheel" index={2} active={active} current={currentName("wheel", design)}>
          <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 py-3 max-lg:[mask-image:linear-gradient(90deg,transparent,#000_1rem,#000_calc(100%_-_3rem),transparent)] lg:mx-0 lg:grid lg:grid-cols-9 lg:gap-2 lg:overflow-visible lg:p-0 lg:pt-2">
            {WHEELS.map((wheel) => (
              <label key={wheel.id} className="group relative shrink-0 cursor-pointer snap-start p-1" title={wheel.name}>
                <input
                  type="radio"
                  name="wheel"
                  value={wheel.id}
                  checked={design.wheel === wheel.id}
                  onChange={set("wheel")}
                  className="peer sr-only"
                />
                <span className="sr-only">{wheel.name}</span>
                <img
                  src={wheel.texture}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  className="block size-14 rounded-full object-cover transition duration-500 ease-snap group-hover:rotate-90 peer-checked:rotate-[200deg] lg:size-full lg:max-w-12"
                />
                <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/15 transition peer-checked:ring-[3px] peer-checked:ring-brand-lime peer-focus-visible:ring-white" />
              </label>
            ))}
          </div>
        </OptionGroup>

        <SwatchGroup part="truck" index={3} active={active} value={design.truck} onChange={set("truck")} />
        <SwatchGroup part="bolt" index={4} active={active} value={design.bolt} onChange={set("bolt")} />
        {mobileFooter ? <div className="pt-2 lg:hidden">{mobileFooter}</div> : null}
      </div>
    </div>
  );
}

function OptionGroup({
  part,
  index,
  active,
  current,
  children,
}: {
  part: Part;
  index: number;
  active: Part;
  current?: string;
  children: React.ReactNode;
}) {
  const label = PARTS.find((p) => p.key === part)!.label;
  return (
    <fieldset id={`group-${part}`} className={clsx(active !== part && "max-lg:hidden")}>
      <legend className="flex w-full items-baseline justify-between gap-4 max-lg:sr-only">
        <span className="flex items-baseline gap-2.5">
          <span className="font-mono text-[0.65rem] text-white/40">0{index}</span>
          <span className="font-display text-[1.6rem] uppercase leading-none text-white">{label}</span>
        </span>
        <span key={current} className="anim-fade-up font-mono text-xs uppercase tracking-widest text-brand-lime [--d:0s]" aria-hidden="true">
          {current}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function SwatchGroup({
  part,
  index,
  active,
  value,
  onChange,
}: {
  part: "truck" | "bolt";
  index: number;
  active: Part;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <OptionGroup part={part} index={index} active={active} current={METALS.find((m) => m.id === value)?.name}>
      <div className="flex flex-wrap gap-3 pt-3 lg:pt-2">
        {METALS.map((metal) => (
          <label key={metal.id} className="group relative cursor-pointer p-1" title={metal.name}>
            <input
              type="radio"
              name={part}
              value={metal.id}
              checked={value === metal.id}
              onChange={onChange}
              className="peer sr-only"
            />
            <span className="sr-only">{metal.name}</span>
            <span
              className="block size-12 rounded-full shadow-[inset_0_-6px_10px_rgba(0,0,0,0.4),inset_0_4px_6px_rgba(255,255,255,0.4)] transition duration-300 ease-slap group-hover:scale-110 peer-checked:scale-105"
              style={{ backgroundColor: metal.color }}
            />
            <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/15 transition peer-checked:ring-[3px] peer-checked:ring-brand-lime peer-focus-visible:ring-white" />
          </label>
        ))}
      </div>
    </OptionGroup>
  );
}
