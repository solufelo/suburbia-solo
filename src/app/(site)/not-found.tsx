import Link from "next/link";

import { buttonClasses } from "@/components/ButtonLink";
import { Heading } from "@/components/Heading";

export default function NotFound() {
  return (
    <section className="bg-texture bg-brand-gray px-6 pb-24 ~pt-44/48 md:~pt-36/40">
      <div className="mx-auto max-w-3xl">
        <Heading as="h1" size="lg" className="leading-[0.85]">
          Bailed.
        </Heading>
        <p className="mt-6 text-lg">That page does not exist (or the board sold out of the catalogue).</p>
        <Link href="/boards" className={buttonClasses({ className: "mt-10" })}>
          See every board
        </Link>
      </div>
    </section>
  );
}
