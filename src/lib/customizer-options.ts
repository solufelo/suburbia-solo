/**
 * Everything the board builder can offer, in one place. The cart, the
 * checkout API and the 3D preview all read from here, so an id that is not in
 * these lists can never be bought.
 *
 * Textures are generated from assets/images by scripts/build-textures.py.
 */

export type DeckOption = { id: string; name: string; texture: string; thumb: string };
export type WheelOption = { id: string; name: string; texture: string };
export type MetalOption = { id: string; name: string; color: string };

const deck = (id: string, name: string): DeckOption => ({
  id,
  name,
  texture: `/textures/decks/${id}.webp`,
  thumb: `/textures/decks/${id}-thumb.webp`,
});

const wheel = (id: string, name: string): WheelOption => ({
  id,
  name,
  texture: `/textures/wheels/${id}.webp`,
});

export const DECKS: readonly DeckOption[] = [
  deck("thank-you", "Thank You"),
  deck("oni-mask", "Oni Mask"),
  deck("pink-swirl", "Pink Drop"),
  deck("red-black", "Red & Black"),
  deck("green-navy", "Green Navy"),
  deck("yellow-black", "Yellow & Black"),
  deck("black-yellow", "Black & Yellow"),
  deck("red-white", "Red & White"),
  deck("gray-black", "Gray & Black"),
  deck("grid-streaks", "Grid Streaks"),
  deck("against-the-tide", "Against the Tide"),
];

export const WHEELS: readonly WheelOption[] = [
  wheel("cream", "Cream"),
  wheel("black", "Black"),
  wheel("red", "Red"),
  wheel("pink", "Pink"),
  wheel("purple", "Purple"),
  wheel("blue", "Blue"),
  wheel("navy", "Navy"),
  wheel("green", "Green"),
  wheel("yellow", "Yellow"),
];

export const METALS: readonly MetalOption[] = [
  { id: "silver", name: "Silver", color: "#6F6E6A" },
  { id: "black", name: "Black", color: "#1C1C1C" },
  { id: "gold", name: "Gold", color: "#C9A227" },
  { id: "red", name: "Red", color: "#C8102E" },
  { id: "purple", name: "Purple", color: "#692E54" },
  { id: "lime", name: "Lime", color: "#D9F154" },
];

export type BoardDesign = {
  deck: string;
  wheel: string;
  truck: string;
  bolt: string;
};

export const DEFAULT_DESIGN: BoardDesign = {
  deck: "thank-you",
  wheel: "cream",
  truck: "silver",
  bolt: "silver",
};

/**
 * Price of a custom complete, in cents. Same as the catalogue completes so the
 * builder never quietly costs more; change it here and the cart, checkout API
 * and Stripe line items all follow.
 */
export const CUSTOM_BOARD_PRICE_CENTS = 5999;

export const findDeck = (id: string) => DECKS.find((d) => d.id === id);
export const findWheel = (id: string) => WHEELS.find((w) => w.id === id);
export const findMetal = (id: string) => METALS.find((m) => m.id === id);

export function isValidDesign(value: unknown): value is BoardDesign {
  if (!value || typeof value !== "object") return false;
  const d = value as Record<string, unknown>;
  return (
    typeof d.deck === "string" &&
    typeof d.wheel === "string" &&
    typeof d.truck === "string" &&
    typeof d.bolt === "string" &&
    Boolean(findDeck(d.deck) && findWheel(d.wheel) && findMetal(d.truck) && findMetal(d.bolt))
  );
}

/** Texture URLs and colours for the 3D model. Unknown ids fall back to defaults. */
export function resolveDesign(design: BoardDesign) {
  const deckOpt = findDeck(design.deck) ?? findDeck(DEFAULT_DESIGN.deck)!;
  const wheelOpt = findWheel(design.wheel) ?? findWheel(DEFAULT_DESIGN.wheel)!;
  const truckOpt = findMetal(design.truck) ?? findMetal(DEFAULT_DESIGN.truck)!;
  const boltOpt = findMetal(design.bolt) ?? findMetal(DEFAULT_DESIGN.bolt)!;
  return {
    deck: deckOpt,
    wheel: wheelOpt,
    truck: truckOpt,
    bolt: boltOpt,
    deckTextureURL: deckOpt.texture,
    wheelTextureURL: wheelOpt.texture,
    truckColor: truckOpt.color,
    boltColor: boltOpt.color,
  };
}

/** "Oni Mask deck · Pink wheels · Gold trucks · Silver bolts" */
export function describeDesign(design: BoardDesign): string {
  const r = resolveDesign(design);
  return `${r.deck.name} deck · ${r.wheel.name} wheels · ${r.truck.name} trucks · ${r.bolt.name} bolts`;
}

/** Stable key so two identical custom boards share one cart line. */
export function designKey(design: BoardDesign): string {
  return `${design.deck}.${design.wheel}.${design.truck}.${design.bolt}`;
}

/** Builder URL that reopens a design, e.g. from the cart's "Edit" link. */
export function designHref(design: Partial<BoardDesign>): string {
  const params = new URLSearchParams();
  for (const key of ["deck", "wheel", "truck", "bolt"] as const) {
    if (design[key]) params.set(key, design[key]!);
  }
  const qs = params.toString();
  return qs ? `/build?${qs}` : "/build";
}

/** Reads ?deck=&wheel=&truck=&bolt= and keeps only valid ids. */
export function designFromParams(
  params: Record<string, string | string[] | undefined>,
): Partial<BoardDesign> {
  const pick = (key: string) => {
    const v = params[key];
    return typeof v === "string" ? v : undefined;
  };
  const out: Partial<BoardDesign> = {};
  const deckId = pick("deck");
  const wheelId = pick("wheel");
  const truckId = pick("truck");
  const boltId = pick("bolt");
  if (deckId && findDeck(deckId)) out.deck = deckId;
  if (wheelId && findWheel(wheelId)) out.wheel = wheelId;
  if (truckId && findMetal(truckId)) out.truck = truckId;
  if (boltId && findMetal(boltId)) out.bolt = boltId;
  return out;
}

/**
 * "Shuffle" in the builder: a random valid design that is never the one you
 * already have. `rand` is injectable so tests can seed it.
 */
export function randomDesign(rand: () => number = Math.random, current?: BoardDesign): BoardDesign {
  const pick = <T,>(list: readonly T[]) => list[Math.min(list.length - 1, Math.floor(rand() * list.length))];
  const next: BoardDesign = {
    deck: pick(DECKS).id,
    wheel: pick(WHEELS).id,
    truck: pick(METALS).id,
    bolt: pick(METALS).id,
  };
  if (current && designKey(next) === designKey(current)) {
    const i = DECKS.findIndex((d) => d.id === next.deck);
    next.deck = DECKS[(i + 1) % DECKS.length].id;
  }
  return next;
}
