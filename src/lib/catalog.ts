/**
 * Product catalogue: Prismic `skateboard` documents normalised into plain,
 * serialisable objects that both server and client components can use.
 *
 * Prismic owns name, price, image and (once the updated custom type is pushed)
 * description and the matching customiser deck. Until those two fields are
 * filled in Prismic, PRODUCT_EXTRAS below provides them.
 */
import { asText, isFilled, type Content, type ImageField, type RichTextField } from "@prismicio/client";
import { cache } from "react";

import { createClient } from "./prismicio";
import { findDeck } from "./customizer-options";

export type Product = {
  id: string;
  uid: string;
  name: string;
  /** Price in cents. */
  price: number;
  image: ImageField;
  description: string;
  /** Matching deck id in the board builder, if there is one. */
  deck: string | null;
  /** Accent colour for the hand-drawn scribble behind the board. */
  accent: string;
  href: string;
};

type Extras = { description: string; deck: string; accent: string };

/** Local copy for fields the Prismic model does not carry yet. */
const PRODUCT_EXTRAS: Record<string, Extras> = {
  "oni-mask": {
    description:
      "A snarling red oni mask wrapped in smoke on a bone-coloured deck. Loud enough for the park, clean enough for the wall.",
    deck: "oni-mask",
    accent: "#FF7347",
  },
  "pink-drop": {
    description:
      "Hot pink with a paint-drop splash and a tiny Suburbia mark up top. The board that gets asked about at every session.",
    deck: "pink-swirl",
    accent: "#FF4FA3",
  },
  "red--black": {
    description:
      "The Suburbia wordmark in dripping red over a scuffed black deck. Our classic, built to take a beating.",
    deck: "red-black",
    accent: "#E2231A",
  },
  "green-navy": {
    description:
      "Acid-green wordmark on deep navy. Reads from across the lot and hides scuffs like a champ.",
    deck: "green-navy",
    accent: "#B8D432",
  },
};

const FALLBACK_ACCENT = "#4876FF";

// `description` and `deck_id` are in customtypes/skateboard but only exist on
// documents once the model is pushed to Prismic, so treat them as optional.
type SkateboardDoc = Omit<Content.SkateboardDocument, "data"> & {
  data: Omit<Content.SkateboardDocument["data"], "description" | "deck_id"> & {
    description?: unknown;
    deck_id?: unknown;
  };
};

export function toProduct(doc: SkateboardDoc): Product | null {
  const { data } = doc;
  if (!doc.uid || !isFilled.keyText(data.name) || !isFilled.number(data.price) || !isFilled.image(data.image)) {
    return null;
  }
  const extras = PRODUCT_EXTRAS[doc.uid];

  const cmsDescription = Array.isArray(data.description) ? asText(data.description as RichTextField).trim() : "";
  const cmsDeck = typeof data.deck_id === "string" && findDeck(data.deck_id) ? data.deck_id : null;

  return {
    id: doc.id,
    uid: doc.uid,
    name: data.name,
    price: Math.round(data.price),
    image: data.image,
    description:
      cmsDescription ||
      extras?.description ||
      `${data.name}: a complete Suburbia board, assembled and ready to ride.`,
    deck: cmsDeck ?? extras?.deck ?? null,
    accent: extras?.accent ?? FALLBACK_ACCENT,
    href: `/boards/${doc.uid}`,
  };
}

/** All boards, in the order editors set on the homepage product grid when possible. */
export const getProducts = cache(async (): Promise<Product[]> => {
  const client = createClient();
  const docs = await client.getAllByType("skateboard", {
    orderings: [{ field: "my.skateboard.name" }],
  });
  return docs
    .map((doc) => toProduct(doc as unknown as SkateboardDoc))
    .filter((p): p is Product => p !== null);
});

export const getProduct = cache(async (uid: string): Promise<Product | null> => {
  const products = await getProducts();
  return products.find((p) => p.uid === uid) ?? null;
});
