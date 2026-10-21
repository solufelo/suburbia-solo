import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  DECKS,
  DEFAULT_DESIGN,
  WHEELS,
  describeDesign,
  designFromParams,
  designHref,
  isValidDesign,
  resolveDesign,
} from "@/lib/customizer-options";

const publicDir = resolve(__dirname, "..", "public");

describe("customizer options", () => {
  it("ships a texture and thumbnail file for every option", () => {
    for (const d of DECKS) {
      expect(existsSync(resolve(publicDir, `.${d.texture}`)), d.texture).toBe(true);
      expect(existsSync(resolve(publicDir, `.${d.thumb}`)), d.thumb).toBe(true);
    }
    for (const w of WHEELS) {
      expect(existsSync(resolve(publicDir, `.${w.texture}`)), w.texture).toBe(true);
    }
  });

  it("validates designs strictly", () => {
    expect(isValidDesign(DEFAULT_DESIGN)).toBe(true);
    expect(isValidDesign({ ...DEFAULT_DESIGN, deck: "nope" })).toBe(false);
    expect(isValidDesign({ ...DEFAULT_DESIGN, truck: 3 })).toBe(false);
    expect(isValidDesign(null)).toBe(false);
  });

  it("resolves ids to textures and colours, falling back to defaults", () => {
    const r = resolveDesign({ deck: "oni-mask", wheel: "pink", truck: "gold", bolt: "nope" });
    expect(r.deckTextureURL).toBe("/textures/decks/oni-mask.webp");
    expect(r.wheelTextureURL).toBe("/textures/wheels/pink.webp");
    expect(r.truckColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(r.bolt.id).toBe(DEFAULT_DESIGN.bolt);
  });

  it("round-trips a design through the builder URL", () => {
    const design = { deck: "red-white", wheel: "navy", truck: "black", bolt: "lime" };
    const href = designHref(design);
    const params = Object.fromEntries(new URL(href, "http://x").searchParams);
    expect(designFromParams(params)).toEqual(design);
  });

  it("drops unknown or repeated query values", () => {
    expect(designFromParams({ deck: "<script>", wheel: ["pink", "red"], truck: "gold" })).toEqual({
      truck: "gold",
    });
  });

  it("describes a design in words", () => {
    expect(describeDesign({ deck: "oni-mask", wheel: "pink", truck: "gold", bolt: "silver" })).toBe(
      "Oni Mask deck · Pink wheels · Gold trucks · Silver bolts",
    );
  });
});
