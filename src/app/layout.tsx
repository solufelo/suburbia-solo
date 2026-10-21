import type { Metadata, Viewport } from "next";
import { Bowlby_One_SC, DM_Mono } from "next/font/google";
import { asImageSrc } from "@prismicio/client";

import "./globals.css";
import { SVGFilters } from "@/components/SVGFilters";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SkateboardProvider } from "@/contexts/SkateboardContext";
import { CartProvider } from "@/contexts/CartContext";
import { createClient } from "@/lib/prismicio";
import { SITE_NAME, siteUrl } from "@/lib/site";

const bowlby = Bowlby_One_SC({
  variable: "--font-bowlby-sc",
  subsets: ["latin"],
  weight: ["400"],
});

const DMMono = DM_Mono({
  variable: "--font-DM-mono",
  subsets: ["latin"],
  weight: ["500"],
});

export const viewport: Viewport = {
  themeColor: "#f7d0e9",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await createClient()
    .getSingle("settings")
    .catch(() => null);
  const name = settings?.data.site_title || SITE_NAME;
  const description =
    settings?.data.meta_description ||
    "Complete skateboards and a 3D board builder. Design a board that is as real as the places you will take it.";
  const ogImage = settings ? asImageSrc(settings.data.fallback_og_image) : null;

  return {
    metadataBase: new URL(siteUrl()),
    title: { default: name, template: `%s · ${name}` },
    description,
    applicationName: name,
    openGraph: {
      type: "website",
      siteName: name,
      locale: "en_CA",
      images: [{ url: ogImage || "/Images/Suburbia-OG.png", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bowlby.variable} ${DMMono.variable} antialiased font-medium text-zinc-800`}>
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
