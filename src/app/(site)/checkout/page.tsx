import type { Metadata } from "next";

import { getCheckoutMode } from "@/lib/checkout";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { canceled } = await searchParams;
  return <CheckoutClient mode={getCheckoutMode()} canceled={canceled === "1"} />;
}
