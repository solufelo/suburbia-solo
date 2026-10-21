"use client";

import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { FaCheck, FaExclamationTriangle, FaLock } from "react-icons/fa";

import { buttonClasses } from "@/components/ButtonLink";
import { LineThumb } from "@/components/cart/LineThumb";
import { Receipt } from "@/components/checkout/Receipt";
import { DeckFan } from "@/components/shop/DeckFan";
import { MarkerNote } from "@/components/zine";
import { useCart } from "@/contexts/CartContext";
import type { CheckoutMode } from "@/lib/checkout";
import { collectFieldErrors } from "@/lib/checkout-form";
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
  // Client-side problems, shown in the page's own error style (not browser tooltips).
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const collectAddress = mode === "mock";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    const invalid = collectFieldErrors(
      Array.from(form.elements).filter((el): el is HTMLInputElement => el instanceof HTMLInputElement),
    );
    const count = Object.keys(invalid).length;
    if (count > 0) {
      setFieldErrors(invalid);
      setError({ message: `Fix ${count === 1 ? "the highlighted field" : `the ${count} highlighted fields`} and try again.` });
      form.querySelector<HTMLInputElement>(`[name="${Object.keys(invalid)[0]}"]`)?.focus();
      return;
    }
    setFieldErrors({});
    const f = new FormData(form);
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
    fieldErrors[name] ?? (error?.field && error.field.endsWith(name) ? error.message : undefined);

  // Typing into a flagged field clears its message.
  function onInput(e: FormEvent<HTMLFormElement>) {
    const name = (e.target as HTMLInputElement).name;
    if (!fieldErrors[name]) return;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  const empty = ready && lines.length === 0;

  return (
    <section className="bg-texture page-top relative overflow-hidden bg-paper pb-[clamp(4rem,8vw,7rem)]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <ModeBanner mode={mode} />
            <h1 className="font-display t-xl mt-6 uppercase">
              <span className="block overflow-hidden pb-[0.04em]">
                <span className="anim-rise block">Checkout</span>
              </span>
            </h1>
          </div>
          <Steps current={empty ? 0 : 1} />
        </div>

        {!ready ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-12" aria-label="Loading your cart" role="status">
            <div className="space-y-4 lg:col-span-7">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse bg-ink/[0.07]" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <div className="h-96 animate-pulse bg-ink/[0.07] lg:col-span-5" />
          </div>
        ) : empty ? (
          <div className="mt-12 grid items-center gap-10 border-2 border-ink bg-white p-8 shadow-[10px_10px_0_#151314] md:grid-cols-[1fr_auto] md:p-12">
            <div>
              <p className="font-display t-lg uppercase">
                Your cart is <span className="riso">empty</span>
              </p>
              <p className="lede mt-4 max-w-[40ch] text-ink/70">Add a board first, then come back here to check out.</p>
              <div className="mt-8 flex flex-wrap gap-x-4 gap-y-5">
                <Link href="/boards" className={buttonClasses({ size: "md" })}>
                  Shop boards
                </Link>
                <Link href="/build" className={buttonClasses({ color: "lime", size: "md" })}>
                  Build your own
                </Link>
              </div>
            </div>
            <div aria-hidden="true" className="relative w-[24rem] max-md:hidden">
              <MarkerNote className="absolute -top-4 right-2 z-10 -rotate-6 text-3xl text-brand-hot">go on, pick one</MarkerNote>
              <DeckFan count={7} className="pt-10" />
            </div>
          </div>
        ) : (
          <div className="mt-12 grid items-start gap-x-14 gap-y-14 lg:grid-cols-12">
            <form
              onSubmit={onSubmit}
              onInput={onInput}
              noValidate
              className="anim-fade-up lg:col-span-7 [--d:0.15s]"
              aria-describedby={error ? "checkout-error" : undefined}
            >
              {error ? (
                <p
                  id="checkout-error"
                  role="alert"
                  className="mb-8 flex items-start gap-3 border-2 border-ink bg-white px-4 py-3.5 shadow-[5px_5px_0_#ff7347]"
                >
                  <FaExclamationTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-brand-orange" />
                  <span>{error.message}</span>
                </p>
              ) : null}

              <Fieldset index="01" legend="Contact">
                <Field label="Full name" name="name" autoComplete="name" required minLength={2} maxLength={80} error={fieldError("name")} />
                <Field label="Email" name="email" type="email" autoComplete="email" required maxLength={120} error={fieldError("email")} />
              </Fieldset>

              {collectAddress ? (
                <Fieldset index="02" legend="Ship to">
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
                  <label className="flex flex-col gap-2" htmlFor="f-country">
                    <span className="kicker text-ink/70">Country</span>
                    <select id="f-country" name="country" autoComplete="country" defaultValue="CA" className="field-input appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2012%208%22%3E%3Cpath%20d=%22M1%201l5%205%205-5%22%20stroke=%22%23151314%22%20stroke-width=%222%22%20fill=%22none%22/%3E%3C/svg%3E')] bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat pr-10">
                      <option value="CA">Canada</option>
                      <option value="US">United States</option>
                    </select>
                  </label>
                </Fieldset>
              ) : (
                <p className="mb-8 border-l-4 border-brand-lime pl-4 text-ink/70">
                  You will enter your shipping address and card on Stripe&apos;s secure page next.
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                data-testid="place-order"
                className={clsx(
                  buttonClasses({ size: "lg", className: "!mx-4 mt-2 flex w-[calc(100%-2rem)] justify-center" }),
                  "disabled:!opacity-100",
                  pending && "cursor-wait !bg-bottom",
                )}
              >
                {pending ? (
                  <>
                    <WheelSpinner />
                    Rolling it up…
                  </>
                ) : mode === "stripe-test" ? (
                  `Pay ${formatPrice(subtotal)} with Stripe`
                ) : (
                  `Place demo order · ${formatPrice(subtotal)}`
                )}
              </button>
              <p className="mt-5 flex items-center justify-center gap-2 font-mono text-[0.7rem] uppercase tracking-widest text-ink/55">
                <FaLock aria-hidden="true" className="size-3" />
                Prices are checked again on the server
              </p>
            </form>

            <aside aria-labelledby="summary-title" className="anim-fade-up lg:sticky lg:top-24 lg:col-span-5 [--d:0.3s]">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 id="summary-title" className="kicker">
                  Order summary
                </h2>
                <button type="button" onClick={open} className="min-h-11 px-1 font-mono text-xs font-medium uppercase tracking-widest">
                  <span className="link-hl">Edit cart</span>
                </button>
              </div>
              <Receipt
                title="Order preview"
                reference={<span>{new Date().toLocaleDateString("en-CA")}</span>}
                total={subtotal}
                totalTestId="checkout-total"
                footer="Nothing is charged in demo mode"
                lines={lines.map((line) => ({
                  key: line.key,
                  qty: line.qty,
                  name: line.name,
                  description: line.kind === "custom" ? describeDesign(line.design) : "Complete board",
                  amount: line.unitPrice * line.qty,
                  thumb: <LineThumb line={line} className="h-16 w-8" />,
                }))}
              />
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function Steps({ current }: { current: number }) {
  const steps = ["Cart", "Details", "Done"];
  return (
    <ol className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-widest" aria-label="Checkout steps">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2" aria-current={i === current ? "step" : undefined}>
          <span
            className={clsx(
              "grid size-7 place-items-center rounded-full border-2 border-ink",
              i < current && "bg-ink text-paper",
              i === current && "bg-brand-lime",
            )}
          >
            {i < current ? <FaCheck aria-hidden="true" className="size-3" /> : i + 1}
          </span>
          <span className={clsx(i === current ? "text-ink" : "text-ink/50")}>{s}</span>
          {i < steps.length - 1 ? <span aria-hidden="true" className="mx-1 h-0.5 w-6 bg-ink/30" /> : null}
        </li>
      ))}
    </ol>
  );
}

function WheelSpinner() {
  return (
    <svg viewBox="0 0 48 48" className="anim-spin size-7" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="24" cy="24" r="6" fill="currentColor" />
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x="22" y="6" width="4" height="11" fill="currentColor" transform={`rotate(${a} 24 24)`} />
      ))}
    </svg>
  );
}

function Fieldset({ index, legend, children }: { index: string; legend: string; children: ReactNode }) {
  return (
    <fieldset className="mb-10">
      <legend className="mb-5 flex items-center gap-3">
        <span className="grid h-7 min-w-9 place-items-center bg-ink px-1.5 font-mono text-xs text-paper">{index}</span>
        <span className="font-display text-[2rem] uppercase leading-none">{legend}</span>
      </legend>
      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">{children}</div>
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
    <label className={clsx("flex flex-col gap-2", className)} htmlFor={id}>
      <span className="kicker text-ink/70">{label}</span>
      <input
        id={id}
        {...input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field-input"
      />
      {error ? (
        <span id={`${id}-error`} className="flex items-center gap-1.5 text-sm font-medium text-[#c2410c]">
          <FaExclamationTriangle aria-hidden="true" className="size-3" />
          {error}
        </span>
      ) : null}
    </label>
  );
}

function ModeBanner({ mode }: { mode: CheckoutMode }) {
  if (mode === "stripe-test") {
    return (
      <p className="relative inline-block max-w-2xl -rotate-1 border-2 border-ink bg-brand-lime px-4 py-3 text-sm shadow-[5px_5px_0_#151314]" data-testid="mode-banner">
        <span aria-hidden="true" className="tape -left-6 -top-3 w-16 rotate-[-30deg]" />
        <strong className="font-display mr-1 text-[1.15rem] uppercase">Stripe test mode.</strong> No real money moves. Pay with the
        test card <code className="bg-white px-1">4242 4242 4242 4242</code>, any future date and any CVC.
      </p>
    );
  }
  if (mode === "refused-live-key") {
    return (
      <p className="inline-block border-2 border-ink bg-brand-orange px-4 py-3 text-sm" data-testid="mode-banner">
        Checkout is switched off on this demo.
      </p>
    );
  }
  return (
    <p className="relative inline-block max-w-2xl -rotate-1 border-2 border-ink bg-brand-lime px-4 py-3 text-sm shadow-[5px_5px_0_#151314]" data-testid="mode-banner">
      <span aria-hidden="true" className="tape -left-6 -top-3 w-16 rotate-[-30deg]" />
      <strong className="font-display mr-1 text-[1.15rem] uppercase">Demo checkout.</strong> This is a portfolio shop: no card is asked
      for, nothing is charged and no order is shipped.
    </p>
  );
}
