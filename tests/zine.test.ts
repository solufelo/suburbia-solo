import { describe, expect, it } from "vitest";

import { DEFAULT_DESIGN, designKey, isValidDesign, randomDesign } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import { burstStickers, hashString, priceLine, prng, ransomTiles, splitLastWord } from "@/lib/zine";

describe("ransom-note tiles", () => {
  it("cuts a word the same way every time (server and browser must match)", () => {
    expect(ransomTiles("Cul-de-sac")).toEqual(ransomTiles("Cul-de-sac"));
    expect(ransomTiles("Cul-de-sac")).not.toEqual(ransomTiles("Rack"));
  });

  it("keeps every character, in order, and leaves spaces unstyled", () => {
    const tiles = ransomTiles("Go skate");
    expect(tiles.map((t) => t.char).join("")).toBe("Go skate");
    const space = tiles[2];
    expect(space).toEqual({ char: " ", className: "", rotate: 0, shift: 0 });
  });

  it("never puts the same scrap on two neighbouring letters and keeps tilt readable", () => {
    for (const word of ["Cul-de-sac", "Bailed.", "rolling", "Rack", "aaaaaaaaaaaa"]) {
      const tiles = ransomTiles(word).filter((t) => t.char !== " ");
      tiles.forEach((t, i) => {
        expect(Math.abs(t.rotate)).toBeLessThanOrEqual(7);
        expect(Math.abs(t.shift)).toBeLessThanOrEqual(0.05);
        if (i > 0) expect(t.className).not.toBe(tiles[i - 1].className);
      });
    }
  });
});

describe("splitLastWord", () => {
  it("splits a headline before its last word", () => {
    expect(splitLastWord("Escape the Cul-de-sac")).toEqual({ lead: "Escape the", last: "Cul-de-sac" });
  });
  it("handles one word and messy whitespace", () => {
    expect(splitLastWord("  Bailed.  ")).toEqual({ lead: "", last: "Bailed." });
    expect(splitLastWord("Escape \n the   rack")).toEqual({ lead: "Escape the", last: "rack" });
  });
});

describe("priceLine", () => {
  it("says 'Every complete' when every board costs the same", () => {
    expect(priceLine([5999, 5999], 5999, formatPrice)).toEqual({ label: "Every complete", amount: "$59.99" });
  });
  it("says 'Completes from' with the lowest price when prices differ", () => {
    expect(priceLine([6999, 4999, 5999], 5999, formatPrice)).toEqual({ label: "Completes from", amount: "$49.99" });
  });
  it("falls back to the custom build price when the catalogue is empty or broken", () => {
    expect(priceLine([], 5999, formatPrice)).toEqual({ label: "Custom builds", amount: "$59.99" });
    expect(priceLine([NaN, 0, -1], 5999, formatPrice).label).toBe("Custom builds");
  });
});

describe("prng / hashString", () => {
  it("is deterministic per seed and stays in [0, 1)", () => {
    const a = prng(42);
    const b = prng(42);
    const seqA = Array.from({ length: 50 }, a);
    expect(seqA).toEqual(Array.from({ length: 50 }, b));
    expect(seqA.every((n) => n >= 0 && n < 1)).toBe(true);
    expect(hashString("rack")).toBe(hashString("rack"));
    expect(hashString("rack")).not.toBe(hashString("Rack"));
  });
});

describe("burstStickers", () => {
  it("rings the receipt: right count, spread around, deterministic", () => {
    const burst = burstStickers(12, 7);
    expect(burst).toHaveLength(12);
    expect(burstStickers(12, 7)).toEqual(burst);
    // Stickers land in all four quadrants rather than clumping on one side.
    const quadrants = new Set(burst.map((b) => `${Math.sign(b.x)}:${Math.sign(b.y)}`));
    expect(quadrants.size).toBe(4);
    for (const b of burst) {
      const r = Math.hypot(b.x, b.y / 1.25);
      expect(r).toBeGreaterThanOrEqual(185);
      expect(r).toBeLessThanOrEqual(285);
    }
  });
});

describe("randomDesign (builder Shuffle)", () => {
  it("always returns a design the shop can sell", () => {
    for (let i = 0; i < 200; i++) expect(isValidDesign(randomDesign())).toBe(true);
  });

  it("is reproducible with a seeded random source", () => {
    expect(randomDesign(prng(3))).toEqual(randomDesign(prng(3)));
  });

  it("never hands back the design you already have", () => {
    // A random source that always picks index 0 would reproduce the first options.
    const zero = () => 0;
    const first = randomDesign(zero);
    const next = randomDesign(zero, first);
    expect(designKey(next)).not.toBe(designKey(first));
    expect(isValidDesign(next)).toBe(true);
  });

  it("copes with a random source that returns exactly 1", () => {
    expect(isValidDesign(randomDesign(() => 1))).toBe(true);
    expect(designKey(randomDesign(() => 0.5, DEFAULT_DESIGN))).not.toBe("");
  });
});
