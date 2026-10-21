/**
 * Cart state as plain data + a pure reducer, so it can be unit tested and
 * persisted to localStorage without React.
 *
 * Prices stored on a line are a display snapshot only. The checkout API looks
 * every price up again on the server and never trusts these numbers.
 */
import { BoardDesign, designKey, isValidDesign } from "./customizer-options";

export const MAX_QTY = 10;
export const MAX_LINES = 20;
export const CART_STORAGE_KEY = "suburbia:cart:v1";

export type BoardLine = {
  kind: "board";
  key: string;
  uid: string;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
};

export type CustomLine = {
  kind: "custom";
  key: string;
  design: BoardDesign;
  name: string;
  unitPrice: number;
  qty: number;
};

export type CartLine = BoardLine | CustomLine;

export type NewLine =
  | Omit<BoardLine, "key" | "qty">
  | Omit<CustomLine, "key" | "qty">;

export type CartAction =
  | { type: "add"; line: NewLine; qty?: number }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "clear" }
  | { type: "replace"; lines: CartLine[] };

export function lineKey(line: NewLine): string {
  return line.kind === "board" ? `board:${line.uid}` : `custom:${designKey(line.design)}`;
}

const clampQty = (qty: number) =>
  Math.min(MAX_QTY, Math.max(0, Math.floor(Number.isFinite(qty) ? qty : 0)));

export function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add": {
      const key = lineKey(action.line);
      const qty = clampQty(action.qty ?? 1);
      if (qty === 0) return state;
      const existing = state.find((l) => l.key === key);
      if (existing) {
        return state.map((l) =>
          l.key === key ? { ...l, qty: clampQty(l.qty + qty) } : l,
        );
      }
      if (state.length >= MAX_LINES) return state;
      return [...state, { ...action.line, key, qty } as CartLine];
    }
    case "setQty": {
      const qty = clampQty(action.qty);
      if (qty === 0) return state.filter((l) => l.key !== action.key);
      return state.map((l) => (l.key === action.key ? { ...l, qty } : l));
    }
    case "remove":
      return state.filter((l) => l.key !== action.key);
    case "clear":
      return [];
    case "replace":
      return action.lines;
  }
}

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);

export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);

const isStr = (v: unknown, max = 200): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= max;

const isCents = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 10_000_000;

/**
 * Reads whatever is in localStorage and keeps only well-formed lines. Anything
 * a user (or an old version of the site) left there that does not fit is
 * dropped rather than crashing the page.
 */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const lines: CartLine[] = [];
  for (const item of data.slice(0, MAX_LINES)) {
    if (!item || typeof item !== "object") continue;
    const l = item as Record<string, unknown>;
    const qty = clampQty(Number(l.qty));
    if (qty === 0 || !isStr(l.name) || !isCents(l.unitPrice)) continue;

    if (l.kind === "board" && isStr(l.uid, 100) && typeof l.image === "string") {
      const line: NewLine = {
        kind: "board",
        uid: l.uid,
        name: l.name,
        image: l.image.slice(0, 500),
        unitPrice: l.unitPrice,
      };
      lines.push({ ...line, key: lineKey(line), qty });
    } else if (l.kind === "custom" && isValidDesign(l.design)) {
      const { deck, wheel, truck, bolt } = l.design;
      const line: NewLine = {
        kind: "custom",
        design: { deck, wheel, truck, bolt },
        name: l.name,
        unitPrice: l.unitPrice,
      };
      lines.push({ ...line, key: lineKey(line), qty });
    }
  }
  // Collapse duplicates that may have been written by two tabs.
  return lines.reduce<CartLine[]>((acc, line) => {
    const prev = acc.find((l) => l.key === line.key);
    if (prev) prev.qty = clampQty(prev.qty + line.qty);
    else acc.push(line);
    return acc;
  }, []);
}
