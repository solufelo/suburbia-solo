"use client";

import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import { Button, buttonClasses } from "@/components/ButtonLink";
import { Heading } from "@/components/Heading";
import { LineThumb } from "@/components/cart/LineThumb";
import { useCart } from "@/contexts/CartContext";
import type { CheckoutMode } from "@/lib/checkout";
import { describeDesign } from "@/lib/customizer-options";
import { formatPrice } from "@/lib/money";
import { saveReceipt, type MockReceipt } from "@/lib/receipt";

type Props = { mode: CheckoutMode; canceled: boolean };

type ApiResult =
  | { mode: "mock"; orderId: string; url: string; receipt: MockReceipt }
  | { mode: "stripe-test"; url: string }
  | { error: string; field?: string };

export function CheckoutClient({ mode, canceled }: Props) {
  const { lines, subtotal, ready, clear, open } = useCart();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(
    canceled ? { message: "Payment was canceled. Your cart is still here." } : null,
  );

  const collectAddress = mode === "mock";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const f = new FormData(e.currentTarget);
    const text = (name: string) => String(f.get(name) ?? "").trim();

    const body = {
      items: lines.map((l) =>
        l.kind === "board"
          ? { kind: "board" as const, uid: l.uid, qty: l.qty }
          : { kind: "custom" as const, design: l.design, qty: l.qty },
      ),
      customer: {
        name: text("name"),
        email: text("email"),
        ...(collectAddress
          ? {
              address: {
                line1: text("line1"),
                city: text("city"),
                region: text("region"),
                postalCode: text("postalCode"),
                country: text("country"),
              },
            }
          : {}),
      },
    };

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as ApiResult;
      if (!res.ok || "error" in data) {
        const err = data as { error?: string; field?: string };
        setError({ message: err.error || "Something went wrong. Please try again.", field: err.field });
        setPending(false);
        return;
      }
      if (data.mode === "mock") {
        saveReceipt(data.receipt);
        clear();
        router.push(data.url);
      } else {
        // Hosted Stripe Checkout (test mode). The cart is cleared on return.
        window.location.assign(data.url);
      }
    } catch {
      setError({ message: "Could not reach the checkout. Check your connection and try again." });
      setPending(false);
    }
  }

  const fieldError = (name: string) =>
    error?.field && error.field.endsWith(name) ? error.message : undefined;

  return (
    <section className="bg-texture bg-brand-gray px-6 pb-24 ~pt-44/48 md:~pt-36/40">
      <div className="mx-auto w-full max-w-6xl">
        <ModeBanner mode={mode} />

        <Heading as="h1" size="lg" className="mt-8 leading-[0.9]">
          Checkout
        </Heading>

        {!ready ? (
          <div className="mt-10 h-64 animate-pulse bg-zinc-200/60" aria-label="Loading your cart" />
        ) : lines.length === 0 ? (
          <div className="mt-10 flex flex-col items-start gap-6 border-2 border-black bg-white p-8 shadow-[10px_10px_0_#000]">
            <p className="font-bowlby text-2xl uppercase">Your cart is empty</p>
            <p className="text-zinc-600">Add a board first, then come back here.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/boards" className={buttonClasses({ size: "sm" })}>
                Shop boards
              </Link>
              <Link href="/build" className={buttonClasses({ color: "lime", size: "sm" })}>
                Build your own
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <form
              onSubmit={onSubmit}
              noValidate={false}
              className="border-2 border-black bg-white p-6 shadow-[10px_10px_0_#000] sm:p-8"
              aria-describedby={error ? "checkout-error" : undefined}
            >
              {error ? (
                <p
                  id="checkout-error"
                  role="alert"
                  className="mb-6 border-2 border-black bg-brand-orange/20 px-4 py-3 text-sm"
                >
                  {error.message}
                </p>
              ) : null}

              <Fieldset legend="Contact">
                <Field label="Full name" name="name" autoComplete="name" required minLength={2} maxLength={80} error={fieldError("name")} />
                <Field label="Email" name="email" type="email" autoComplete="email" required maxLength={120} error={fieldError("email")} />
              </Fieldset>

              {collectAddress ? (
                <Fieldset legend="Ship to">
                  <Field label="Street address" name="line1" autoComplete="address-line1" required minLength={3} maxLength={120} error={fieldError("line1")} className="sm:col-span-2" />
                  <Field label="City" name="city" autoComplete="address-level2" required maxLength={60} error={fieldError("city")} />
                  <Field label="Province / state" name="region" autoComplete="address-level1" required maxLength={40} error={fieldError("region")} />
                  <Field
                    label="Postal / ZIP code"
                    name="postalCode"
                    autoComplete="postal-code"
                    required
                    maxLength={12}
                    pattern="[A-Za-z]\d[A-Za-z][ \-]?\d[A-Za-z]\d|\d{5}(-\d{4})?"
                    title="A Canadian postal code (A1A 1A1) or a US ZIP"
                    error={fieldError("postalCode")}
                  />
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs uppercase tracking-widest text-zinc-600">Country</span>
                    <select name="country" autoComplete="country" defaultValue="CA" className={inputClass}>
                      <option value="CA">Canada</option>
                      <option value="US">United States</option>
                    </select>
                  </label>
                </Fieldset>
              ) : (
                <p className="mb-6 text-sm text-zinc-600">
                  You will enter your shipping address and card on Stripe&apos;s secure page next.
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                icon="cart"
                disabled={pending}
                className="mt-2 !whitespace-normal text-left"
                data-testid="place-order"
              >
                {pending
                  ? "Working…"
                  : mode === "stripe-test"
                    ? `Pay ${formatPrice(subtotal)} with Stripe`
                    : `Place demo order · ${formatPrice(subtotal)}`}
              </Button>
            </form>

            <aside aria-labelledby="summary-title" className="bg-texture relative bg-zinc-900 p-6 text-white sm:p-8 lg:sticky lg:top-8">
              <div className="flex items-baseline justify-between">
                <h2 id="summary-title" className="font-bowlby text-2xl uppercase">
                  Order summary
                </h2>
                <button type="button" onClick={open} className="text-sm text-brand-lime underline underline-offset-4">
                  Edit cart
                </button>
              </div>
              <ul className="mt-6 divide-y divide-dashed divide-zinc-700">
                {lines.map((line) => (
                  <li key={line.key} className="flex items-center gap-4 py-4">
                    <div className="relative">
                      <LineThumb line={line} className="h-20 w-10" />
                      <span className="absolute -right-3 -top-2 grid size-6 place-items-center rounded-full bg-brand-lime text-xs text-black">
                        {line.qty}
                      </span>
                    </div>
                    <div className="min-w-0 grow">
                      <p className="font-bowlby leading-tight">{line.name}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {line.kind === "custom" ? describeDesign(line.design) : "Complete board"}
                      </p>
                    </div>
                    <p className="shrink-0 tabular-nums">{formatPrice(line.unitPrice * line.qty)}</p>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t-2 border-zinc-700 pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Shipping &amp; tax</dt>
                  <dd>Not charged (demo)</dd>
                </div>
                <div className="flex items-baseline justify-between pt-2 text-white">
                  <dt className="font-bowlby text-lg uppercase">Total</dt>
                  <dd className="font-bowlby text-3xl tabular-nums" data-testid="checkout-total">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-zinc-500">
                Prices are checked again on the server before anything is charged.
              </p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

const inputClass =
  "w-full border-2 border-black bg-white px-3 py-2.5 font-DMMono text-base outline-none transition focus:shadow-[4px_4px_0_#d9f154] focus:ring-0 aria-[invalid=true]:border-brand-orange";

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="mb-8">
      <legend className="mb-4 font-bowlby text-xl uppercase">{legend}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  error,
  className,
  ...input
}: React.ComponentProps<"input"> & { label: string; error?: string; name: string }) {
  const id = `f-${input.name}`;
  return (
    <label className={clsx("flex flex-col gap-1.5", className)} htmlFor={id}>
      <span className="text-xs uppercase tracking-widest text-zinc-600">{label}</span>
      <input
        id={id}
        {...input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass}
      />
      {error ? (
        <span id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function ModeBanner({ mode }: { mode: CheckoutMode }) {
  if (mode === "stripe-test") {
    return (
      <p className="inline-block -rotate-1 border-2 border-black bg-brand-lime px-4 py-3 text-sm shadow-[6px_6px_0_#000]" data-testid="mode-banner">
        <strong className="font-bowlby uppercase">Stripe test mode.</strong> No real money moves. Pay with the test card{" "}
        <code className="bg-white px-1">4242 4242 4242 4242</code>, any future date and any CVC.
      </p>
    );
  }
  if (mode === "refused-live-key") {
    return (
      <p className="inline-block border-2 border-black bg-brand-orange px-4 py-3 text-sm" data-testid="mode-banner">
        Checkout is switched off on this demo.
      </p>
    );
  }
  return (
    <p className="inline-block -rotate-1 border-2 border-black bg-brand-lime px-4 py-3 text-sm shadow-[6px_6px_0_#000]" data-testid="mode-banner">
      <strong className="font-bowlby uppercase">Demo checkout.</strong> This is a portfolio shop: no card is asked for, nothing is
      charged and no order is shipped.
    </p>
  );
}
