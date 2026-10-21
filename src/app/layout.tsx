import type { Metadata, Viewport } from "next";
import { Archivo, DM_Mono, Permanent_Marker } from "next/font/google";

import "./globals.css";
import { SVGFilters } from "@/components/SVGFilters";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SkateboardProvider } from "@/contexts/SkateboardContext";
import { CartProvider } from "@/contexts/CartContext";
import { createClient } from "@/lib/prismicio";
import { SITE_NAME, siteUrl } from "@/lib/site";

/*
 * Type system
 * - Archivo (variable, wdth 62-125): extra-condensed black for display, normal width for text.
 * - DM Mono: labels, prices, receipts.
 * - Permanent Marker: hand-written annotations, used sparingly.
 * All three are self-hosted by next/font (latin subset only).
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f3eee4",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await createClient()
    .getSingle("settings")
    .catch(() => null);
  const name = settings?.data.site_title || SITE_NAME;
  const description =
    settings?.data.meta_description && settings.data.meta_description !== "The best skateboards"
      ? settings.data.meta_description
      : "Complete skateboards and a 3D board builder. Pick a graphic, spin it, swap the wheels and hardware, and make it yours.";

  return {
    metadataBase: new URL(siteUrl()),
    title: { default: name, template: `%s · ${name}` },
    description,
    applicationName: name,
    openGraph: {
      type: "website",
      siteName: name,
      locale: "en_CA",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Suburbia Skate: escape the cul-de-sac" }],
    },
    twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Scroll reveals only hide content once we know JS is running. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body className={`${archivo.variable} ${dmMono.variable} ${marker.variable} grain antialiased`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SkateboardProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
          <SVGFilters />
        </SkateboardProvider>
      </body>
    </html>
  );
}
