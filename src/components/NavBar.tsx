import React from "react";
import Link from "next/link";
import { PrismicNextLink } from "@prismicio/next";
import { isFilled } from "@prismicio/client";

import { Logo } from "./Logo";
import { CartButton } from "./cart/CartButton";
import { createClient } from "@/lib/prismicio";

export async function NavBar() {
  const client = createClient();
  const settings = await client.getSingle("settings").catch(() => null);
  const navigation = settings?.data.navigation ?? [];

  // The shop index is new; show it even before editors add it in Prismic.
  const hasShopLink = navigation.some(
    (item) => isFilled.link(item.link) && "url" in item.link && item.link.url === "/boards",
  );

  return (
    <header className="header absolute left-0 right-0 top-0 z-50 ~h-32/48 ~px-4/6 ~py-4/6 hd:h-32">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto,auto] items-center gap-x-6 gap-y-3 md:grid-cols-[1fr,auto,1fr]">
        <Link href="/" className="justify-self-start" aria-label="Suburbia Skate home">
          <Logo className="text-brand-purple ~h-12/20" />
        </Link>
        <nav
          aria-label="Main"
          className="col-span-full row-start-2 md:col-span-1 md:col-start-2 md:row-start-1"
        >
          <ul className="flex flex-wrap items-center justify-center ~gap-5/8">
            {!hasShopLink ? (
              <li>
                <Link href="/boards" className="font-DMMono ~text-lg/xl hover:underline">
                  Shop
                </Link>
              </li>
            ) : null}
            {navigation.map((item) => (
              <li key={item.link.text}>
                <PrismicNextLink field={item.link} className="font-DMMono ~text-lg/xl hover:underline" />
              </li>
            ))}
          </ul>
        </nav>
        <div className="justify-self-end">
          <CartButton />
        </div>
      </div>
    </header>
  );
}
