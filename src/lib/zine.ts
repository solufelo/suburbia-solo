/**
 * Deterministic "random" styling for collage pieces, so the server render and
 * the browser render match and a word always gets cut out the same way.
 */

export type RansomTile = {
  char: string;
  className: string;
  /** Degrees. */
  rotate: number;
  /** Vertical nudge in em. */
  shift: number;
};

// Paper scraps: background + ink + typeface. Kept to the brand inks.
const SCRAPS = [
  "bg-ink text-paper font-display",
  "bg-brand-lime text-ink font-wide",
  "bg-paper text-ink font-display",
  "bg-brand-hot text-ink font-display",
  "bg-white text-ink font-mono font-medium",
  "bg-brand-orange text-ink font-wide",
  "bg-kraft text-ink font-display",
  "bg-brand-blue text-white font-display",
] as const;

/** Small, fast, seedable PRNG (mulberry32). */
export function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * One tile per character. Neighbouring letters never share a scrap, and
 * rotation stays within ±7° so the word still reads at a glance.
 */
export function ransomTiles(word: string): RansomTile[] {
  const rand = prng(hashString(word));
  let last = -1;
  return Array.from(word).map((char) => {
    if (char === " ") return { char, className: "", rotate: 0, shift: 0 };
    let pick = Math.floor(rand() * SCRAPS.length);
    if (pick === last) pick = (pick + 1 + Math.floor(rand() * (SCRAPS.length - 1))) % SCRAPS.length;
    last = pick;
    const rotate = Math.round((rand() * 14 - 7) * 10) / 10;
    const shift = Math.round((rand() * 0.1 - 0.05) * 100) / 100;
    return { char, className: SCRAPS[pick], rotate, shift };
  });
}

/** Splits a headline so its last word can get the ransom treatment. */
export function splitLastWord(text: string): { lead: string; last: string } {
  const trimmed = text.trim().replace(/\s+/g, " ");
  const i = trimmed.lastIndexOf(" ");
  if (i === -1) return { lead: "", last: trimmed };
  return { lead: trimmed.slice(0, i), last: trimmed.slice(i + 1) };
}

/**
 * Price sticker copy from the real catalogue: "Every complete $59.99" when all
 * boards cost the same, otherwise "Completes from $49.99".
 */
export function priceLine(
  prices: number[],
  fallback: number,
  format: (cents: number) => string,
): { label: string; amount: string } {
  const valid = prices.filter((p) => Number.isFinite(p) && p > 0);
  if (valid.length === 0) return { label: "Custom builds", amount: format(fallback) };
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return min === max
    ? { label: "Every complete", amount: format(min) }
    : { label: "Completes from", amount: format(min) };
}

export type BurstSticker = {
  kind: "star" | "dot";
  /** Text colour class for stars. */
  color: string;
  /** Background class for dots. */
  bg: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
};

const BURST_COLORS = [
  { color: "text-brand-lime", bg: "bg-brand-lime" },
  { color: "text-brand-hot", bg: "bg-brand-hot" },
  { color: "text-brand-orange", bg: "bg-brand-orange" },
  { color: "text-brand-blue", bg: "bg-brand-blue" },
  { color: "text-ink", bg: "bg-ink" },
];

/**
 * Where the confirmation-page stickers land: spread evenly around a ring
 * (with jitter) so they frame the receipt instead of clumping.
 */
export function burstStickers(count: number, seed: number): BurstSticker[] {
  const rand = prng(seed);
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.4;
    const radius = 190 + rand() * 90;
    const c = BURST_COLORS[i % BURST_COLORS.length];
    return {
      kind: i % 3 === 0 ? "dot" : "star",
      color: c.color,
      bg: c.bg,
      x: Math.round(Math.cos(angle) * radius),
      y: Math.round(Math.sin(angle) * radius * 1.25),
      rotate: Math.round(rand() * 360 - 180),
      delay: Math.round(rand() * 25) / 100,
    };
  });
}
