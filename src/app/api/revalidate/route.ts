import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

/**
 * Prismic webhook: clears the cached CMS content after a publish.
 *
 * Only callers that know PRISMIC_WEBHOOK_SECRET may purge the cache. Prismic
 * sends the secret in the JSON body (set it in Prismic > Settings > Webhooks).
 */
export async function POST(req: Request) {
  const expected = process.env.PRISMIC_WEBHOOK_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  let secret: unknown;
  try {
    ({ secret } = (await req.json()) as { secret?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const a = Buffer.from(typeof secret === "string" ? secret : "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  revalidateTag("prismic");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
