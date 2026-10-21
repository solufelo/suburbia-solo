import { describe, expect, it, vi } from "vitest";

import {
  checkoutSchema,
  createStripeSession,
  getCheckoutMode,
  getStripeSession,
  priceOrder,
  type CatalogEntry,
} from "@/lib/checkout";
import { CUSTOM_BOARD_PRICE_CENTS } from "@/lib/customizer-options";

const catalog: CatalogEntry[] = [
  { uid: "oni-mask", name: "Oni Mask", price: 5999, imageUrl: "https://images.prismic.io/s/oni.png" },
  { uid: "pink-drop", name: "Pink Drop", price: 6499, imageUrl: null },
];

const customer = { name: "Sam Rider", email: "sam@example.com" };
const design = { deck: "oni-mask", wheel: "pink", truck: "gold", bolt: "silver" };

describe("getCheckoutMode", () => {
  it("uses the mock without a key, Stripe for test keys, and refuses live keys", () => {
    expect(getCheckoutMode(undefined)).toBe("mock");
    expect(getCheckoutMode("")).toBe("mock");
    expect(getCheckoutMode("sk_test_123")).toBe("stripe-test");
    expect(getCheckoutMode("rk_test_123")).toBe("stripe-test");
    expect(getCheckoutMode("sk_live_123")).toBe("refused-live-key");
  });
});

describe("checkoutSchema", () => {
  it("accepts a valid order", () => {
    const r = checkoutSchema.safeParse({
      items: [{ kind: "board", uid: "oni-mask", qty: 2 }, { kind: "custom", design, qty: 1 }],
      customer,
    });
    expect(r.success).toBe(true);
  });

  it.each([
    ["empty cart", { items: [], customer }],
    ["zero quantity", { items: [{ kind: "board", uid: "oni-mask", qty: 0 }], customer }],
    ["huge quantity", { items: [{ kind: "board", uid: "oni-mask", qty: 500 }], customer }],
    ["fractional quantity", { items: [{ kind: "board", uid: "oni-mask", qty: 1.5 }], customer }],
    ["unknown custom option", { items: [{ kind: "custom", design: { ...design, deck: "x" }, qty: 1 }], customer }],
    ["client-supplied price", { items: [{ kind: "board", uid: "oni-mask", qty: 1, unitPrice: 1 }], customer }],
    ["bad email", { items: [{ kind: "board", uid: "oni-mask", qty: 1 }], customer: { ...customer, email: "nope" } }],
    ["extra customer fields", { items: [{ kind: "board", uid: "oni-mask", qty: 1 }], customer: { ...customer, isAdmin: true } }],
    [
      "bad postal code",
      {
        items: [{ kind: "board", uid: "oni-mask", qty: 1 }],
        customer: { ...customer, address: { line1: "1 Main St", city: "Brampton", region: "ON", postalCode: "12", country: "CA" } },
      },
    ],
  ])("rejects %s", (_label, body) => {
    expect(checkoutSchema.safeParse(body).success).toBe(false);
  });
});

describe("priceOrder", () => {
  it("prices boards from the catalogue and custom boards from the constant", () => {
    const { lines, subtotal } = priceOrder(
      [
        { kind: "board", uid: "pink-drop", qty: 2 },
        { kind: "custom", design, qty: 1 },
      ],
      catalog,
    );
    expect(lines[0]).toMatchObject({ name: "Pink Drop", unitAmount: 6499, qty: 2 });
    expect(lines[1]).toMatchObject({ unitAmount: CUSTOM_BOARD_PRICE_CENTS, design });
    expect(lines[1].description).toContain("Pink wheels");
    expect(subtotal).toBe(6499 * 2 + CUSTOM_BOARD_PRICE_CENTS);
  });

  it("rejects boards that are not in the catalogue", () => {
    expect(() => priceOrder([{ kind: "board", uid: "ghost", qty: 1 }], catalog)).toThrow(/no longer available/);
  });
});

describe("createStripeSession", () => {
  it("sends server prices to Stripe as form data and returns the hosted URL", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ id: "cs_test_abc", url: "https://checkout.stripe.com/c/pay/cs_test_abc" }), {
        status: 200,
      }),
    );
    const { lines } = priceOrder(
      [
        { kind: "board", uid: "oni-mask", qty: 1 },
        { kind: "custom", design, qty: 2 },
      ],
      catalog,
    );
    const session = await createStripeSession({
      secretKey: "sk_test_x",
      origin: "https://shop.example",
      lines,
      email: customer.email,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(session.url).toContain("checkout.stripe.com");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.stripe.com/v1/checkout/sessions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer sk_test_x");
    const form = new URLSearchParams(init.body as string);
    expect(form.get("mode")).toBe("payment");
    expect(form.get("line_items[0][price_data][unit_amount]")).toBe("5999");
    expect(form.get("line_items[0][price_data][product_data][images][0]")).toBe("https://images.prismic.io/s/oni.png");
    expect(form.get("line_items[1][quantity]")).toBe("2");
    // Relative custom-deck image becomes absolute on the shop origin.
    expect(form.get("line_items[1][price_data][product_data][images][0]")).toBe(
      "https://shop.example/textures/decks/oni-mask-thumb.webp",
    );
    expect(form.get("success_url")).toBe("https://shop.example/checkout/success?session_id={CHECKOUT_SESSION_ID}");
  });

  it("refuses live keys before calling Stripe", async () => {
    const fetchImpl = vi.fn();
    await expect(
      createStripeSession({ secretKey: "sk_live_x", origin: "https://x", lines: [], email: "a@b.co", fetchImpl }),
    ).rejects.toThrow(/test keys/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("turns a Stripe error into a 502 without leaking details", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: { message: "secret detail" } }), { status: 400 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      createStripeSession({ secretKey: "sk_test_x", origin: "https://x", lines: [], email: "a@b.co", fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toMatchObject({ status: 502, message: "Payment provider error. Please try again." });
  });
});

describe("getStripeSession", () => {
  it("only looks up well-formed test session ids", async () => {
    const fetchImpl = vi.fn();
    expect(await getStripeSession("../../v1/charges", { secretKey: "sk_test_x", fetchImpl })).toBeNull();
    expect(await getStripeSession("cs_live_abcdefghijk", { secretKey: "sk_test_x", fetchImpl })).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("summarises a paid session", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          id: "cs_test_abcdefghijk",
          payment_status: "paid",
          amount_total: 5999,
          currency: "cad",
          customer_details: { email: "sam@example.com" },
        }),
      ),
    );
    const s = await getStripeSession("cs_test_abcdefghijk", { secretKey: "sk_test_x", fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(s).toEqual({ id: "cs_test_abcdefghijk", paymentStatus: "paid", amountTotal: 5999, currency: "cad", email: "sam@example.com" });
  });
});
