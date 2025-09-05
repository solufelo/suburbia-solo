import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import React from "react";
import { asImageSrc } from "@prismicio/client";

import { createClient } from "@/lib/prismicio";
import { Logo } from "@/components/Logo";
import { Bounded } from "./Bounded";
import { FooterPhysics } from "./FooterPhysics";

export async function Footer() {
  const client = createClient();
  const settings = await client.getSingle("settings");

  // Get skateboard images - try footer_skateboards first, fallback to all skateboards
  let boardTextureURLs: string[] = [];
  
  if (settings.data.footer_skateboards && settings.data.footer_skateboards.length > 0) {
    // Use the dedicated footer skateboards field if available
    boardTextureURLs = settings.data.footer_skateboards
      .map((item) => asImageSrc(item.skateboard, { h: 600 }))
      .filter((url): url is string => Boolean(url));
  } else {
    // Fallback to getting all skateboards if footer_skateboards is not available
    const skateboards = await client.getAllByType("skateboard");
    boardTextureURLs = skateboards
      .map((skateboard) => asImageSrc(skateboard.data.image, { h: 600 }))
      .filter((url): url is string => Boolean(url))
      .slice(0, 8); // Limit to 8 boards
  }

  // Skateboard textures loaded

  return (
    <footer className="bg-texture bg-zinc-900 text-white overflow-hidden">
      <div className="relative h-[75vh] ~p-10/16 md:aspect-auto">
        {/* Local Pexels image from public folder */}
        <img
          src="/Images/pexels-artempodrez-4816744.jpg"
          alt="Skateboard background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <FooterPhysics
          boardTextureURLs={boardTextureURLs}
          className="absolute inset-0 overflow-hidden z-10"
        />
        <Logo className="pointer-events-none relative h-20 mix-blend-exclusion md:h-28 z-20" />
      </div>
      <Bounded as="nav">
        <ul className="flex flex-wrap justify-center gap-8 ~text-lg/xl">
          {settings.data.navigation?.map((item) => (
            <li key={item.link.text} className="hover:underline">
              <PrismicNextLink field={item.link} />
            </li>
          ))}
        </ul>
      </Bounded>
      {/* List of links */}
    </footer>
  );
}