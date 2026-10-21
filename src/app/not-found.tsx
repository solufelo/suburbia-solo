import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { NotFoundView } from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** Any URL that matches no route at all. Same look as the shop's own 404. */
export default function RootNotFound() {
  return (
    <>
      <NavBar />
      <main id="main">
        <NotFoundView />
      </main>
      <Footer />
    </>
  );
}
