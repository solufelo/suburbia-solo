import { NextResponse, type NextRequest } from "next/server";
import { asImageSrc } from "@prismicio/client";

import { getProducts } from "@/lib/catalog";
import {
  CheckoutError,
  checkoutSchema,
  createStripeSession,
  getCheckoutMode,
  newOrderId,
  priceOrder,
} from "@/lib/checkout";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;

/**
 * POST /api/checkout
 *
 * Public by design (guest checkout; the shop has no accounts or roles).
 * Accepts only JSON, caps the body size, validates every field, and re-prices
 * the order from the catalogue so a tampered cart cannot change what is paid.
 */
export async function POST(req: NextRequest) {
  try {
    if (!req.headers.get("content-type")?.includes("application/json")) {
      throw new CheckoutError(415, "Send the order as JSON.");
    }
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) throw new CheckoutError(413, "Order is too large.");

    const mode = getCheckoutMode();
    if (mode === "refused-live-key") {
      console.error("[checkout] STRIPE_SECRET_KEY is not a test key; refusing to take payments.");
      throw new CheckoutError(503, "Checkout is unavailable right now.");
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new CheckoutError(400, "Order is not valid JSON.");
    }

    const parsed = checkoutSchema.safeParse(json);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: issue?.message ?? "Invalid order.",
          field: issue?.path.join("."),
        },
        { status: 400 },
      );
    }
    const { items, customer } = parsed.data;

    const products = await getProducts();
    const priced = priceOrder(
      items,
      products.map((p) => ({
        uid: p.uid,
        name: p.name,
        price: p.price,
        imageUrl: asImageSrc(p.image, { h: 600 }) ?? null,
      })),
    );

    if (mode === "mock") {
      if (!customer.address) {
        return NextResponse.json(
          { error: "Enter a shipping address.", field: "customer.address" },
          { status: 400 },
        );
      }
      const orderId = newOrderId();
      // Nothing is stored or charged: the receipt goes back to the browser only.
      return NextResponse.json({
        mode,
        orderId,
        url: `/checkout/success?order=${orderId}`,
        receipt: {
          orderId,
          name: customer.name,
          email: customer.email,
          lines: priced.lines.map((l) => ({
            name: l.name,
            description: l.description,
            qty: l.qty,
            unitAmount: l.unitAmount,
          })),
          subtotal: priced.subtotal,
          currency: priced.currency,
        },
      });
    }

    const origin = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
    const session = await createStripeSession({
      secretKey: process.env.STRIPE_SECRET_KEY!,
      origin,
      lines: priced.lines,
      email: customer.email,
    });
    return NextResponse.json({ mode, url: session.url });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[checkout] unexpected error", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
