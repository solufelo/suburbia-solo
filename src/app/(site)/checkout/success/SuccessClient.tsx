"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonClasses, ButtonIcon } from "@/components/ButtonLink";
import { Heading } from "@/components/Heading";
import { HorizontalLine } from "@/components/Line";
import { useCart } from "@/contexts/CartContext";
import type { StripeSessionSummary } from "@/lib/checkout";
import { formatPrice } from "@/lib/money";
import { loadReceipt, type MockReceipt } from "@/lib/receipt";

type Props = { orderId: string | null; stripe: StripeSessionSummary | null };

export function SuccessClient({ orderId, stripe }: Props) {
  const { clear, ready } = useCart();
  const [receipt, setReceipt] = useState<MockReceipt | null>(null);

  useEffect(() => {
    if (orderId) setReceipt(loadReceipt(orderId));
  }, [orderId]);

  // A paid Stripe session means the cart has been bought.
  useEffect(() => {
    if (ready && stripe?.paymentStatus === "paid") clear();
  }, [ready, stripe, clear]);

  const paid = stripe?.paymentStatus === "paid";
  const reference = receipt?.orderId ?? orderId ?? stripe?.id.slice(-10).toUpperCase() ?? null;

  return (
    <section className="bg-texture relative overflow-hidden bg-brand-pink px-6 pb-24 ~pt-44/48 md:~pt-36/40">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-brand-purple">
          {stripe ? "Stripe test payment" : "Demo order"}
        </p>
        <Heading as="h1" size="lg" className="mt-2 leading-[0.85]">
          {stripe && !paid ? "Almost there" : "You're rolling"}
        </Heading>

        <div className="mt-10 border-2 border-black bg-white p-6 shadow-[10px_10px_0_#000] sm:p-8">
          {reference ? (
            <p className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-zinc-500">Reference</span>
              <span className="font-bowlby text-2xl" data-testid="order-id">
                {reference}
              </span>
            </p>
          ) : null}

          {stripe ? (
            <p className="mt-4">
              {paid
                ? `Stripe confirmed a test payment of ${formatPrice(stripe.amountTotal ?? 0)}${stripe.email ? ` from ${stripe.email}` : ""}. No real money moved.`
                : `Stripe reports this payment as "${stripe.paymentStatus}". Nothing has been charged yet.`}
            </p>
          ) : (
            <p className="mt-4" data-testid="demo-note">
              This was a demo order: nothing was charged and nothing will ship. In a live shop, this is where the
              confirmation email would be sent.
            </p>
          )}

          {receipt ? (
            <>
              <HorizontalLine className="my-6 h-2 w-full stroke-2 text-zinc-300" />
              <ul className="space-y-3">
                {receipt.lines.map((l, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>
                      <span className="font-bowlby">{l.qty} × {l.name}</span>
                      <span className="block text-xs text-zinc-500">{l.description}</span>
                    </span>
                    <span className="tabular-nums">{formatPrice(l.unitAmount * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-baseline justify-between border-t-2 border-black pt-4">
                <span className="font-bowlby uppercase">Total</span>
                <span className="font-bowlby text-3xl tabular-nums">{formatPrice(receipt.subtotal)}</span>
              </p>
              <p className="mt-4 text-sm text-zinc-500">
                For {receipt.name} ({receipt.email}).
              </p>
            </>
          ) : null}
        </div>

        <div className="mt-12 flex flex-wrap gap-6">
          <Link href="/boards" className={buttonClasses({ color: "orange", size: "lg" })}>
            <ButtonIcon icon="skateboard" size="lg" />
            Keep shopping
          </Link>
          <Link href="/build" className={buttonClasses({ color: "purple", size: "lg" })}>
            Build another
          </Link>
        </div>
      </div>
    </section>
  );
}
