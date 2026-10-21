import type { Content } from "@prismicio/client";
import type { Product } from "@/lib/catalog";

/** Data the homepage fetches once on the server and hands to every slice. */
export type SliceContext = {
  products: Product[];
  skaters: Content.SkaterDocument[];
};
