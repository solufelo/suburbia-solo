import type { Metadata } from "next";

import { getStripeSession } from "@/lib/checkout";
import { SuccessClient } from "./SuccessClient";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { session_id, order } = await searchParams;
  const stripe = typeof session_id === "string" ? await getStripeSession(session_id).catch(() => null) : null;

  return (
    <SuccessClient
      orderId={typeof order === "string" ? order : null}
      stripe={stripe}
    />
  );
}
