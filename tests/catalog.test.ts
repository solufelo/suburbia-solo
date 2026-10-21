import { describe, expect, it } from "vitest";
import { asImageSrc } from "@prismicio/client";

import { getProduct, getProducts, toProduct } from "@/lib/catalog";
import { createClient } from "@/lib/prismicio";
import { productJsonLd, productMetadata } from "@/lib/seo";

describe("Prismic fixtures", () => {
  it("serves singletons, repeatables and UID lookups through the normal client", async () => {
    const client = createClient();
    const home = await client.getSingle("homepage");
    expect(home.data.slices.map((s) => s.slice_type)).toContain("product_grid");
    expect(await client.getAllByType("skater")).toHaveLength(4);
    const board = await client.getByUID("skateboard", "oni-mask");
    expect(board.data.name).toBe("Oni Mask");
  });

  it("points images at the local copies in public/Images", async () => {
    const board = await createClient().getByUID("skateboard", "pink-drop");
    expect(asImageSrc(board.data.image)).toMatch(/^http:\/\/localhost:4311\/Images\/pink-drop-complete\.png/);
  });
});

describe("catalog", () => {
  it("normalises every skateboard into a product with a page URL", async () => {
    const products = await getProducts();
    expect(products.map((p) => p.uid).sort()).toEqual(["green-navy", "oni-mask", "pink-drop", "red--black"]);
    for (const p of products) {
      expect(p.price).toBe(5999);
      expect(p.href).toBe(`/boards/${p.uid}`);
      expect(p.description.length).toBeGreaterThan(20);
      expect(p.deck).toBeTruthy();
    }
    expect(await getProduct("nope")).toBeNull();
  });

  it("skips documents missing a name, price or image", () => {
    const doc = { id: "x", uid: "x", data: { name: null, price: 100, image: {} } };
    expect(toProduct(doc as never)).toBeNull();
  });
});

describe("product SEO", () => {
  it("builds a title, canonical and Open Graph image per product", async () => {
    const product = (await getProduct("oni-mask"))!;
    const meta = productMetadata(product);
    expect(meta.title).toBe("Oni Mask complete skateboard");
    expect(meta.alternates?.canonical).toBe("/boards/oni-mask");
    expect(JSON.stringify(meta.openGraph)).toContain("onimask-complete.png");
  });

  it("emits Product JSON-LD with a real offer and no invented ratings", async () => {
    const [ld, crumbs] = productJsonLd((await getProduct("oni-mask"))!) as Record<string, unknown>[];
    expect(ld["@type"]).toBe("Product");
    expect(ld.offers).toMatchObject({ price: "59.99", priceCurrency: "CAD" });
    expect(ld).not.toHaveProperty("aggregateRating");
    expect(ld).not.toHaveProperty("review");
    expect(crumbs["@type"]).toBe("BreadcrumbList");
  });
});
