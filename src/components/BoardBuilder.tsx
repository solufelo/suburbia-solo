"use client";

/* eslint-disable @next/next/no-img-element */
import React from "react";
import clsx from "clsx";

import { useSkateboard } from "@/contexts/SkateboardContext";
import { DECKS, METALS, WHEELS, type BoardDesign } from "@/lib/customizer-options";

/**
 * Option pickers for the board builder. Each group is a native radio group, so
 * arrow keys, Tab and screen readers behave as expected; the styling sits on
 * the label.
 */
export function BoardBuilder() {
  const { design, updateDesign } = useSkateboard();
  const set = (key: keyof BoardDesign) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateDesign({ [key]: e.target.value });

  return (
    <div className="space-y-8">
      <OptionGroup legend="Deck" current={DECKS.find((d) => d.id === design.deck)?.name}>
        <div className="grid grid-cols-11 gap-1.5 sm:gap-2">
          {DECKS.map((deck) => (
            <label key={deck.id} className="group relative cursor-pointer" title={deck.name}>
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
                className="mx-auto h-auto w-full max-w-12 transition duration-300 group-hover:-translate-y-1 group-hover:-rotate-3 peer-checked:-translate-y-2 peer-checked:drop-shadow-[0_8px_0_#d9f154]"
              />
              <span className="pointer-events-none absolute inset-x-1 -bottom-3 h-1 rounded-full bg-transparent transition peer-checked:bg-brand-lime" />
              <span className="pointer-events-none absolute -inset-1 rounded-md ring-2 ring-transparent transition peer-focus-visible:ring-white" />
            </label>
          ))}
        </div>
      </OptionGroup>

      <OptionGroup legend="Wheels" current={WHEELS.find((w) => w.id === design.wheel)?.name}>
        <div className="grid grid-cols-9 gap-2 sm:flex sm:flex-wrap sm:gap-3 lg:gap-2">
          {WHEELS.map((wheel) => (
            <label key={wheel.id} className="group relative cursor-pointer" title={wheel.name}>
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
                width={40}
                height={40}
                loading="lazy"
                className="aspect-square w-full max-w-10 rounded-full object-cover transition duration-300 group-hover:rotate-45 sm:size-10"
              />
              <span className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-zinc-700 transition peer-checked:ring-brand-lime peer-focus-visible:ring-white" />
            </label>
          ))}
        </div>
      </OptionGroup>

      <SwatchGroup legend="Trucks" name="truck" value={design.truck} onChange={set("truck")} />
      <SwatchGroup legend="Bolts" name="bolt" value={design.bolt} onChange={set("bolt")} />
    </div>
  );
}

function OptionGroup({
  legend,
  current,
  children,
}: {
  legend: string;
  current?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-3 flex w-full items-baseline justify-between gap-4">
        <span className="font-bowlby text-lg uppercase tracking-wide text-white">{legend}</span>
        <span className="text-sm text-brand-lime" aria-hidden="true">
          {current}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function SwatchGroup({
  legend,
  name,
  value,
  onChange,
}: {
  legend: string;
  name: "truck" | "bolt";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <OptionGroup legend={legend} current={METALS.find((m) => m.id === value)?.name}>
      <div className="flex flex-wrap gap-3">
        {METALS.map((metal) => (
          <label key={metal.id} className="relative cursor-pointer" title={metal.name}>
            <input
              type="radio"
              name={name}
              value={metal.id}
              checked={value === metal.id}
              onChange={onChange}
              className="peer sr-only"
            />
            <span className="sr-only">{metal.name}</span>
            <span
              className={clsx(
                "block size-10 rounded-full shadow-[inset_0_-6px_10px_rgba(0,0,0,0.35),inset_0_4px_6px_rgba(255,255,255,0.35)] transition hover:scale-110",
              )}
              style={{ backgroundColor: metal.color }}
            />
            <span className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-zinc-700 transition peer-checked:ring-brand-lime peer-focus-visible:ring-white" />
          </label>
        ))}
      </div>
    </OptionGroup>
  );
}
