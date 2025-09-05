import { ButtonLink } from "@/components/ButtonLink";
import { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import clsx from "clsx";
import { SkaterScribble } from "./SkaterScribble";
type Props = {
  skater: Content.SkaterDocument;
  index: number;
};

export function Skater({ skater, index }: Props) {
  const colors = [
    "text-brand-blue",
    "text-brand-lime", 
    "text-brand-orange",
    "text-brand-pink",
    "text-brand-purple",
  ];

  const scribbleColor = colors[index];

  return (
    <div className="skater group relative flex flex-col items-center gap-6 p-6">
      <div className="stack-layout overflow-hidden relative">
        <PrismicNextImage
          field={skater.data.photo_bg}
          width={500}
          imgixParams={{ q: 20 }}
          alt=""
          className="w-full h-auto object-contain scale-110 transform transition-all duration-1000 ease-in-out group-hover:scale-100 group-hover:brightness-75 group-hover:saturate-[.8]"
        />
        <SkaterScribble className={clsx("absolute inset-0 w-full h-full", scribbleColor)} />
        <PrismicNextImage
          field={skater.data.photo_fg}
          width={500}
          alt=""
          className="absolute inset-0 w-full h-auto object-contain transform transition-transform duration-1000 ease-in-out group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <h3 className="absolute bottom-4 left-4 right-4 font-bowlby text-white text-base md:text-lg lg:text-xl leading-snug tracking-tight z-10">
          <span className="block">{skater.data.first_name}</span>
          <span className="block">{skater.data.last_name}</span>
        </h3>
      </div>
      <ButtonLink field={skater.data.customizer_link} size="sm">
        Build their board
      </ButtonLink>
    </div>
  );
}