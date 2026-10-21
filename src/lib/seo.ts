import { asImageSrc } from "@prismicio/client";
import type { Metadata } from "next";

import type { Product } from "./catalog";
import { CURRENCY, formatPrice } from "./money";
import { SITE_NAME, siteUrl } from "./site";

/** Title, description, canonical and social cards for a product page. */
export function productMetadata(product: Product): Metadata {
  const description = `${product.description} ${formatPrice(product.price)} complete skateboard.`.slice(0, 300);
  const image = asImageSrc(product.image, { h: 1200 });
  return {
    title: `${product.name} complete skateboard`,
    description,
    alternates: { canonical: product.href },
    openGraph: {
      type: "website",
      title: `${product.name} · ${SITE_NAME}`,
      description,
      url: product.href,
      images: image ? [{ url: image, alt: `${product.name} skateboard` }] : undefined,
    },
    twitter: { card: "summary_large_image", title: product.name, description },
  };
}

/**
 * schema.org Product + BreadcrumbList. Deliberately no rating or review data:
 * the shop has none, and made-up ratings break Google's guidelines.
 */
export function productJsonLd(product: Product) {
  const base = siteUrl();
  const url = `${base}${product.href}`;
  const image = asImageSrc(product.image, { h: 1200 });
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      sku: product.uid,
      url,
      image: image ? [image] : undefined,
      brand: { "@type": "Brand", name: "Suburbia" },
      category: "Skateboards > Complete skateboards",
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: CURRENCY.toUpperCase(),
        price: (product.price / 100).toFixed(2),
        itemCondition: "https://schema.org/NewCondition",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: "Boards", item: `${base}/boards` },
        { "@type": "ListItem", position: 3, name: product.name, item: url },
      ],
    },
  ];
}
