"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

import { buttonClasses, ButtonIcon } from "@/components/ButtonLink";
import { Kicker } from "@/components/Heading";
import { Receipt } from "@/components/checkout/Receipt";
import { MarkerNote, RansomWord, StarGlyph } from "@/components/zine";
import { useCart } from "@/contexts/CartContext";
import type { StripeSessionSummary } from "@/lib/checkout";
import { formatPrice } from "@/lib/money";
import { loadReceipt, type MockReceipt } from "@/lib/receipt";
import { burstStickers } from "@/lib/zine";

type Props = { orderId: string | null; stripe: StripeSessionSummary | null };

const BURST = burstStickers(12, 7);

export function SuccessClient({ orderId, stripe }: Props) {
  const { clear, ready } = useCart();
  const [receipt, setReceipt] = useState<MockReceipt | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (orderId) setReceipt(loadReceipt(orderId));
    setLoaded(true);
  }, [orderId]);

  // A paid Stripe session means the cart has been bought.
  useEffect(() => {
    if (ready && stripe?.paymentStatus === "paid") clear();
  }, [ready, stripe, clear]);

  const paid = stripe?.paymentStatus === "paid";
  const reference = receipt?.orderId ?? orderId ?? stripe?.id.slice(-10).toUpperCase() ?? null;
  const pendingStripe = stripe && !paid;

  return (
    <section className="bg-texture page-top relative overflow-hidden bg-brand-pink pb-[clamp(4rem,8vw,7rem)]">
      <div
        aria-hidden="true"
        className="halftone absolute -left-[10%] top-[20%] h-[70%] w-[55%] text-brand-hot/40 [mask-image:radial-gradient(closest-side,#000_30%,transparent)]"
      />
      <div className="wrap relative grid items-start gap-x-14 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-6 lg:pt-6">
          <Kicker index={stripe ? "$" : "✓"} className="anim-fade-up">
            {stripe ? "Stripe test payment" : "Demo order placed"}
          </Kicker>
          <h1 className="font-display mt-5 uppercase leading-[0.8]">
            {pendingStripe ? (
              <span className="block overflow-hidden pb-[0.04em]">
                <span className="anim-rise t-mega block">Almost there</span>
              </span>
            ) : (
              <>
                <span className="block overflow-hidden pb-[0.04em]">
                  <span className="anim-rise t-mega block">You&apos;re</span>
                </span>{" "}
                <RansomWord word="rolling" animate baseDelay={0.3} className="mt-[0.12em] text-[clamp(2.6rem,7.6vw,7.4rem)]" />
              </>
            )}
          </h1>

          <div className="anim-fade-up mt-8 max-w-[44ch] [--d:0.7s]">
            {stripe ? (
              <p className="lede">
                {paid
                  ? `Stripe confirmed a test payment of ${formatPrice(stripe.amountTotal ?? 0)}${stripe.email ? ` from ${stripe.email}` : ""}. No real money moved.`
                  : `Stripe reports this payment as "${stripe.paymentStatus}". Nothing has been charged yet.`}
              </p>
            ) : (
              <p className="lede" data-testid="demo-note">
                This was a demo order: nothing was charged and nothing will ship. In a real shop, this is where your
                confirmation email would land.
              </p>
            )}
          </div>

          <div className="anim-fade-up mt-10 flex flex-wrap items-center gap-x-4 gap-y-6 [--d:0.85s]">
            <Link href="/boards" className={buttonClasses({ color: "orange", size: "lg" })}>
              <ButtonIcon icon="skateboard" size="lg" />
              Keep shopping
            </Link>
            <Link href="/build" className={buttonClasses({ color: "purple", size: "lg" })}>
              Build another
            </Link>
          </div>
          <MarkerNote className="anim-fade-up mt-8 inline-block -rotate-2 text-2xl text-ink/70 [--d:1.1s]">
            now go skate it. (in your head.)
          </MarkerNote>
        </div>

        <div className="relative lg:col-span-5 lg:col-start-8">
          {/* Sticker burst from behind the receipt. */}
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-0 max-lg:hidden">
            {BURST.map((b, i) => (
              <span
                key={i}
                className="absolute left-0 top-0 [animation:burst_0.9s_var(--ease-slap)_both]"
                style={{ "--x": `${Math.round(b.x * 1.35)}px`, "--y": `${Math.round(b.y * 0.8)}px`, "--r": `${b.rotate}deg`, animationDelay: `${0.5 + b.delay}s` } as CSSProperties}
              >
                {b.kind === "star" ? (
                  <StarGlyph className={`size-9 ${b.color}`} />
                ) : (
                  <span className={`block size-7 rounded-full border-[3px] border-white shadow-[2px_3px_0_#151314] ${b.bg}`} />
                )}
              </span>
            ))}
          </div>

          <div className="anim-print relative z-10 [--d:0.35s]">
            {receipt ? (
              <Receipt
                title="Order"
                reference={
                  <span className="font-display text-[1.6rem] normal-case leading-none tracking-normal" data-testid="order-id">
                    {reference}
                  </span>
                }
                total={receipt.subtotal}
                footer={
                  <>
                    For {receipt.name} · {receipt.email}
                    {/* Stamped at the foot of the receipt, after it has printed. */}
                    <span
                      aria-hidden="true"
                      className="anim-stamp mx-auto mt-5 block w-fit border-[5px] border-double border-brand-orange px-4 py-2 text-center font-display text-[1.9rem] uppercase leading-[0.9] tracking-normal text-brand-orange mix-blend-multiply [--d:1.5s] [--r:-7deg]"
                    >
                      Demo
                      <br />
                      <span className="text-[1rem]">Nothing charged</span>
                    </span>
                  </>
                }
                lines={receipt.lines.map((l, i) => ({
                  key: String(i),
                  qty: l.qty,
                  name: l.name,
                  description: l.description,
                  amount: l.unitAmount * l.qty,
                }))}
              />
            ) : (
              <div className="zigzag-bottom bg-white px-8 pb-12 pt-8 font-mono text-sm [filter:drop-shadow(8px_10px_0_rgba(21,19,20,0.85))]">
                {reference ? (
                  <p className="flex flex-wrap items-baseline justify-between gap-2 uppercase tracking-widest">
                    <span className="text-ink/55">Reference</span>
                    <span className="font-display text-[1.8rem] normal-case tracking-normal" data-testid="order-id">
                      {reference}
                    </span>
                  </p>
                ) : null}
                <p className="mt-4 text-ink/70">
                  {loaded
                    ? "The itemised receipt lives in the tab you checked out in. Your order reference is above."
                    : "Printing your receipt…"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
