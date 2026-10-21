import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "@/app/api/checkout/route";

const customer = {
  name: "Sam Rider",
  email: "sam@example.com",
  address: { line1: "1 Main St", city: "Brampton", region: "ON", postalCode: "L6Y 1A1", country: "CA" },
};

function post(body: unknown, headers: Record<string, string> = { "content-type": "application/json" }) {
  return POST(
    new NextRequest("http://localhost:4311/api/checkout", {
      method: "POST",
      headers,
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/checkout (mock mode, Prismic fixtures)", () => {
  it("re-prices the order from the catalogue and returns a demo receipt", async () => {
    const res = await post({
      items: [
        { kind: "board", uid: "oni-mask", qty: 2 },
        { kind: "custom", design: { deck: "green-navy", wheel: "yellow", truck: "black", bolt: "lime" }, qty: 1 },
      ],
      customer,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mode).toBe("mock");
    expect(body.orderId).toMatch(/^SUB-[A-Z0-9]{8}$/);
    expect(body.url).toBe(`/checkout/success?order=${body.orderId}`);
    expect(body.receipt.lines[0]).toMatchObject({ name: "Oni Mask", unitAmount: 5999, qty: 2 });
    expect(body.receipt.subtotal).toBe(5999 * 3);
  });

  it("ignores a tampered client price", async () => {
    const res = await post({ items: [{ kind: "board", uid: "oni-mask", qty: 1, unitPrice: 1 }], customer });
    expect(res.status).toBe(400);
  });

  it("rejects unknown boards, empty carts, bad JSON and non-JSON bodies", async () => {
    expect((await post({ items: [{ kind: "board", uid: "ghost", qty: 1 }], customer })).status).toBe(400);
    expect((await post({ items: [], customer })).status).toBe(400);
    expect((await post("{oops")).status).toBe(400);
    expect((await post("items=1", { "content-type": "application/x-www-form-urlencoded" })).status).toBe(415);
  });

  it("names the field that failed validation", async () => {
    const res = await post({
      items: [{ kind: "board", uid: "oni-mask", qty: 1 }],
      customer: { ...customer, email: "not-an-email" },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ field: "customer.email", error: "Enter a valid email" });
  });

  it("requires a shipping address for the mock checkout", async () => {
    const res = await post({
      items: [{ kind: "board", uid: "oni-mask", qty: 1 }],
      customer: { name: customer.name, email: customer.email },
    });
    expect(res.status).toBe(400);
    expect((await res.json()).field).toBe("customer.address");
  });

  it("rejects oversized bodies", async () => {
    const res = await post({ items: [], customer, padding: "x".repeat(20_000) });
    expect(res.status).toBe(413);
  });
});

describe("POST /api/checkout (Stripe)", () => {
  it("creates a Stripe test session when a test key is set", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    const stripe = vi.fn(async () =>
      new Response(JSON.stringify({ id: "cs_test_1", url: "https://checkout.stripe.com/c/pay/cs_test_1" })),
    );
    vi.stubGlobal("fetch", stripe);

    const res = await post({ items: [{ kind: "board", uid: "pink-drop", qty: 1 }], customer: { name: "Sam", email: "s@x.co" } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ mode: "stripe-test", url: "https://checkout.stripe.com/c/pay/cs_test_1" });
    const form = new URLSearchParams((stripe.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(form.get("line_items[0][price_data][product_data][name]")).toBe("Pink Drop");
    expect(form.get("line_items[0][price_data][unit_amount]")).toBe("5999");
  });

  it("refuses to run with a live key", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_123");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post({ items: [{ kind: "board", uid: "oni-mask", qty: 1 }], customer });
    expect(res.status).toBe(503);
  });
});
