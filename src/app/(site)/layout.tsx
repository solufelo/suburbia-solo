import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

/** Shop pages: Prismic navigation on top, physics footer at the bottom. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
