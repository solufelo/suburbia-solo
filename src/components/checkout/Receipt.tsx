import clsx from "clsx";
import type { ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { formatPrice } from "@/lib/money";

export type ReceiptLine = {
  key: string;
  qty: number;
  name: string;
  description: string;
  amount: number;
  thumb?: ReactNode;
};

/**
 * Till-roll receipt used by the checkout summary and the confirmation page.
 * Mono type, dashed rules, a zigzag tear at the bottom.
 */
export function Receipt({
  title,
  reference,
  lines,
  total,
  totalTestId,
  footer,
  aside,
  className,
}: {
  title: string;
  reference?: ReactNode;
  lines: ReceiptLine[];
  total: number;
  totalTestId?: string;
  footer?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    // The shadow sits on a wrapper: a mask on the same element would cut it off.
    <div className={clsx("relative [filter:drop-shadow(8px_10px_0_rgba(21,19,20,0.85))]", className)}>
    <div className="zigzag-bottom relative bg-white px-6 pb-12 pt-6 font-mono text-[0.82rem] text-ink sm:px-8">
      <div className="flex items-start justify-between gap-4">
        <Logo className="h-10 w-auto text-ink" />
        <div className="text-right text-[0.7rem] uppercase leading-relaxed tracking-widest text-ink/60">
          <p>{title}</p>
          {reference ? <div className="text-ink">{reference}</div> : null}
        </div>
      </div>
      {aside}
      <Rule />
      <ul className="space-y-4">
        {lines.map((l) => (
          <li key={l.key} className="flex items-start gap-3">
            {l.thumb ? <div className="relative shrink-0">{l.thumb}</div> : null}
            <div className="min-w-0 grow">
              <p className="font-medium uppercase">
                {l.qty} × {l.name}
              </p>
              <p className="mt-0.5 text-[0.7rem] leading-snug text-ink/55">{l.description}</p>
            </div>
            <p className="shrink-0 tabular-nums">{formatPrice(l.amount)}</p>
          </li>
        ))}
      </ul>
      <Rule />
      <dl className="space-y-1.5 text-[0.75rem] uppercase tracking-widest">
        <div className="flex justify-between gap-4">
          <dt className="text-ink/55">Items</dt>
          <dd className="tabular-nums">{lines.reduce((n, l) => n + l.qty, 0)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink/55">Shipping &amp; tax</dt>
          <dd>Not charged (demo)</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 pt-3">
          <dt className="font-medium">Total</dt>
          <dd className="font-display text-[2.6rem] normal-case leading-none tracking-normal tabular-nums" data-testid={totalTestId}>
            {formatPrice(total)}
          </dd>
        </div>
      </dl>
      <Rule />
      <Barcode />
      {footer ? <div className="mt-3 text-center text-[0.7rem] uppercase tracking-widest text-ink/55">{footer}</div> : null}
    </div>
    </div>
  );
}

function Rule() {
  return <div aria-hidden="true" className="my-5 border-t-2 border-dashed border-ink/25" />;
}

function Barcode() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto h-12 w-4/5 [background:repeating-linear-gradient(90deg,#151314_0_2px,transparent_2px_4px,#151314_4px_7px,transparent_7px_9px,#151314_9px_10px,transparent_10px_13px)]"
    />
  );
}
