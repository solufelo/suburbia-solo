/** Shop currency (ISO 4217, lower-case as Stripe expects). */
export const CURRENCY = (process.env.NEXT_PUBLIC_SHOP_CURRENCY || "cad").toLowerCase();

const formatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: CURRENCY.toUpperCase(),
  currencyDisplay: "narrowSymbol",
});

/** 5999 -> "$59.99" */
export function formatPrice(cents: number): string {
  return formatter.format(cents / 100);
}
