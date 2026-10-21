/**
 * Server-side checkout: validates what the browser sends, prices every line
 * from the catalogue (never from the client), and either creates a Stripe
 * Checkout Session in TEST mode or returns a clearly-labelled mock order.
 */
import { z } from "zod";

import { MAX_LINES, MAX_QTY } from "./cart";
import {
  CUSTOM_BOARD_PRICE_CENTS,
  describeDesign,
  isValidDesign,
  resolveDesign,
  type BoardDesign,
} from "./customizer-options";
import { CURRENCY } from "./money";

export type CheckoutMode = "mock" | "stripe-test" | "refused-live-key";

/**
 * - no STRIPE_SECRET_KEY        -> mock checkout (nothing is charged)
 * - sk_test_ / rk_test_ key     -> real Stripe Checkout in test mode
 * - anything else (a live key)  -> refused: this is a portfolio demo
 */
export function getCheckoutMode(key = process.env.STRIPE_SECRET_KEY): CheckoutMode {
  if (!key) return "mock";
  if (/^(sk|rk)_test_/.test(key)) return "stripe-test";
  return "refused-live-key";
}

const qty = z.number().int().min(1).max(MAX_QTY);
const optionId = z.string().min(1).max(40);

const itemSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("board"), uid: z.string().min(1).max(100), qty }).strict(),
  z
    .object({
      kind: z.literal("custom"),
      design: z
        .object({ deck: optionId, wheel: optionId, truck: optionId, bolt: optionId })
        .strict()
        .refine(isValidDesign, { message: "Unknown board option" }),
      qty,
    })
    .strict(),
]);

const addressSchema = z
  .object({
    line1: z.string().trim().min(3).max(120),
    city: z.string().trim().min(2).max(60),
    region: z.string().trim().min(2).max(40),
    postalCode: z
      .string()
      .trim()
      .max(12)
      .regex(/^([A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d|\d{5}(-\d{4})?)$/, "Enter a Canadian postal code or US ZIP"),
    country: z.enum(["CA", "US"]),
  })
  .strict();

export const checkoutSchema = z
  .object({
    items: z.array(itemSchema).min(1, "Your cart is empty").max(MAX_LINES),
    customer: z
      .object({
        name: z.string().trim().min(2, "Enter your name").max(80),
        email: z.string().trim().email("Enter a valid email").max(120),
        address: addressSchema.optional(),
      })
      .strict(),
  })
  .strict();

export type CheckoutRequest = z.infer<typeof checkoutSchema>;

export class CheckoutError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export type PricedLine = {
  name: string;
  description: string;
  unitAmount: number;
  qty: number;
  /** Absolute https URL for Stripe, or a site-relative path. */
  image: string | null;
  design?: BoardDesign;
  uid?: string;
};

export type CatalogEntry = { uid: string; name: string; price: number; imageUrl: string | null };

/** Prices each line from the server-side catalogue. Unknown boards are rejected. */
export function priceOrder(items: CheckoutRequest["items"], catalog: CatalogEntry[]) {
  const lines: PricedLine[] = items.map((item) => {
    if (item.kind === "board") {
      const product = catalog.find((p) => p.uid === item.uid);
      if (!product) throw new CheckoutError(400, `That board is no longer available (${item.uid}).`);
      return {
        name: product.name,
        description: "Complete skateboard",
        unitAmount: product.price,
        qty: item.qty,
        image: product.imageUrl,
        uid: product.uid,
      };
    }
    const r = resolveDesign(item.design);
    return {
      name: `Custom board: ${r.deck.name}`,
      description: describeDesign(item.design),
      unitAmount: CUSTOM_BOARD_PRICE_CENTS,
      qty: item.qty,
      image: r.deck.thumb,
      design: item.design,
    };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.unitAmount * l.qty, 0);
  return { lines, subtotal, currency: CURRENCY };
}

export function newOrderId(): string {
  return `SUB-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

const STRIPE_API = "https://api.stripe.com/v1";

type FetchLike = typeof fetch;

/** Creates a hosted Stripe Checkout Session (test mode) and returns its URL. */
export async function createStripeSession(opts: {
  secretKey: string;
  origin: string;
  lines: PricedLine[];
  email: string;
  fetchImpl?: FetchLike;
}): Promise<{ id: string; url: string }> {
  const { secretKey, origin, lines, email, fetchImpl = fetch } = opts;
  if (getCheckoutMode(secretKey) !== "stripe-test") {
    throw new CheckoutError(503, "Only Stripe test keys are accepted.");
  }

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/checkout?canceled=1`);
  form.set("customer_email", email);
  form.set("shipping_address_collection[allowed_countries][0]", "CA");
  form.set("shipping_address_collection[allowed_countries][1]", "US");
  form.set("metadata[source]", "suburbia-demo");

  lines.forEach((line, i) => {
    const p = `line_items[${i}]`;
    form.set(`${p}[quantity]`, String(line.qty));
    form.set(`${p}[price_data][currency]`, CURRENCY);
    form.set(`${p}[price_data][unit_amount]`, String(line.unitAmount));
    form.set(`${p}[price_data][product_data][name]`, line.name);
    form.set(`${p}[price_data][product_data][description]`, line.description);
    const image = line.image?.startsWith("/") ? `${origin}${line.image}` : line.image;
    // Stripe only fetches public https images.
    if (image?.startsWith("https://")) {
      form.set(`${p}[price_data][product_data][images][0]`, image);
    }
    if (line.design) {
      form.set(`${p}[price_data][product_data][metadata][design]`, JSON.stringify(line.design));
    }
  });

  const res = await fetchImpl(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    url?: string;
    error?: { message?: string };
  };
  if (!res.ok || !body.url || !body.id) {
    console.error("[checkout] Stripe error:", res.status, body.error?.message);
    throw new CheckoutError(502, "Payment provider error. Please try again.");
  }
  return { id: body.id, url: body.url };
}

export type StripeSessionSummary = {
  id: string;
  paymentStatus: string;
  amountTotal: number | null;
  currency: string | null;
  email: string | null;
};

/** Reads a test-mode Checkout Session for the success page. */
export async function getStripeSession(
  sessionId: string,
  { secretKey = process.env.STRIPE_SECRET_KEY, fetchImpl = fetch }: { secretKey?: string; fetchImpl?: FetchLike } = {},
): Promise<StripeSessionSummary | null> {
  if (!secretKey || getCheckoutMode(secretKey) !== "stripe-test") return null;
  if (!/^cs_test_[A-Za-z0-9]{10,200}$/.test(sessionId)) return null;
  const res = await fetchImpl(`${STRIPE_API}/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const s = (await res.json()) as {
    id: string;
    payment_status: string;
    amount_total: number | null;
    currency: string | null;
    customer_details?: { email?: string | null } | null;
  };
  return {
    id: s.id,
    paymentStatus: s.payment_status,
    amountTotal: s.amount_total,
    currency: s.currency,
    email: s.customer_details?.email ?? null,
  };
}
