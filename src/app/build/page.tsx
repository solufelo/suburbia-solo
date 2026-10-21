import type { Metadata } from "next";

import { designFromParams } from "@/lib/customizer-options";
import { PageWipe } from "@/components/PageWipe";
import { BuildClient } from "./BuildClient";

export const metadata: Metadata = {
  title: "Build your board",
  description:
    "Pick a deck graphic, wheels, trucks and bolts, see it in 3D, and add your custom complete to the cart.",
  alternates: { canonical: "/build" },
};

export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // ?deck=oni-mask&wheel=pink... opens the builder on a design (from a product
  // page or the cart's Edit link). Unknown ids are ignored.
  const preset = designFromParams(await searchParams);
  return (
    <>
      <PageWipe />
      <BuildClient preset={preset} />
    </>
  );
}
