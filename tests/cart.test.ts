import { describe, expect, it } from "vitest";

import {
  cartCount,
  cartReducer,
  cartSubtotal,
  MAX_LINES,
  MAX_QTY,
  parseStoredCart,
  type CartLine,
  type NewLine,
} from "@/lib/cart";

const board: NewLine = {
  kind: "board",
  uid: "oni-mask",
  name: "Oni Mask",
  image: "https://images.prismic.io/x.png",
  unitPrice: 5999,
};

const custom: NewLine = {
  kind: "custom",
  design: { deck: "pink-swirl", wheel: "pink", truck: "gold", bolt: "silver" },
  name: "Custom Pink Drop",
  unitPrice: 5999,
};

describe("cartReducer", () => {
  it("adds a line and merges repeat adds of the same board", () => {
    let s = cartReducer([], { type: "add", line: board });
    s = cartReducer(s, { type: "add", line: board, qty: 2 });
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ key: "board:oni-mask", qty: 3 });
  });

  it("keeps identical custom designs on one line and different ones apart", () => {
    let s = cartReducer([], { type: "add", line: custom });
    s = cartReducer(s, { type: "add", line: { ...custom } });
    s = cartReducer(s, {
      type: "add",
      line: { ...custom, design: { ...custom.design, wheel: "black" } } as NewLine,
    });
    expect(s.map((l) => l.qty)).toEqual([2, 1]);
  });

  it("clamps quantity to 1..MAX_QTY and removes a line set to 0", () => {
    let s = cartReducer([], { type: "add", line: board, qty: 999 });
    expect(s[0].qty).toBe(MAX_QTY);
    s = cartReducer(s, { type: "setQty", key: "board:oni-mask", qty: -4 });
    expect(s).toEqual([]);
  });

  it("ignores adds of zero and caps the number of lines", () => {
    expect(cartReducer([], { type: "add", line: board, qty: 0 })).toEqual([]);
    let s: CartLine[] = [];
    for (let i = 0; i < MAX_LINES + 5; i++) {
      s = cartReducer(s, { type: "add", line: { ...board, uid: `b${i}` } as NewLine });
    }
    expect(s).toHaveLength(MAX_LINES);
  });

  it("totals count and subtotal", () => {
    let s = cartReducer([], { type: "add", line: board, qty: 2 });
    s = cartReducer(s, { type: "add", line: custom });
    expect(cartCount(s)).toBe(3);
    expect(cartSubtotal(s)).toBe(5999 * 3);
  });

  it("removes and clears", () => {
    let s = cartReducer([], { type: "add", line: board });
    s = cartReducer(s, { type: "add", line: custom });
    s = cartReducer(s, { type: "remove", key: "board:oni-mask" });
    expect(s.map((l) => l.kind)).toEqual(["custom"]);
    expect(cartReducer(s, { type: "clear" })).toEqual([]);
  });
});

describe("parseStoredCart", () => {
  it("round-trips a saved cart", () => {
    let s = cartReducer([], { type: "add", line: board, qty: 2 });
    s = cartReducer(s, { type: "add", line: custom });
    expect(parseStoredCart(JSON.stringify(s))).toEqual(s);
  });

  it("survives garbage without throwing", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("{not json")).toEqual([]);
    expect(parseStoredCart('{"a":1}')).toEqual([]);
  });

  it("drops malformed lines and unknown custom options", () => {
    const raw = JSON.stringify([
      { kind: "board", uid: "oni-mask", name: "Oni", image: "x", unitPrice: 5999, qty: 1 },
      { kind: "board", uid: "", name: "No uid", image: "x", unitPrice: 5999, qty: 1 },
      { kind: "board", uid: "a", name: "Bad price", image: "x", unitPrice: -1, qty: 1 },
      { kind: "custom", design: { deck: "made-up", wheel: "pink", truck: "gold", bolt: "gold" }, name: "x", unitPrice: 1, qty: 1 },
      { kind: "hacker", uid: "x" },
    ]);
    const lines = parseStoredCart(raw);
    expect(lines).toHaveLength(1);
    expect(lines[0].key).toBe("board:oni-mask");
  });

  it("merges duplicate lines and clamps quantities", () => {
    const line = { kind: "board", uid: "oni-mask", name: "Oni", image: "x", unitPrice: 5999, qty: 8 };
    const lines = parseStoredCart(JSON.stringify([line, line]));
    expect(lines).toHaveLength(1);
    expect(lines[0].qty).toBe(MAX_QTY);
  });
});
