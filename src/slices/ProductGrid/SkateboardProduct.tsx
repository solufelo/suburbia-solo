"use client";

import { createClient } from "@/lib/prismicio";
import { Content } from '@prismicio/client'
import React, { useEffect, useState } from 'react'
import { PrismicNextImage } from '@prismicio/next'
import { isFilled } from '@prismicio/client'
import { FaStar } from 'react-icons/fa'
import { ButtonLink } from '@/components/ButtonLink'
import { HorizontalLine, VerticalLine } from '@/components/Line'
import clsx from 'clsx'
import { Scribble } from './Scribble'

async function getDominantColor(image: string) {
    const paletteURL = new URL(image)
    paletteURL.searchParams.set('palette', 'json')
    const response = await fetch(paletteURL.toString())
    const json = await response.json()
    return (json.dominant_colors.vibrant?.hex || json.dominant_colors.vibrant_light?.hex)
}

type Props = {
    id: string;
};

const VERTICAL_LINE_STROKE = "absolute top-0 h-full stroke-2 text-stone-300 transition-colors duration-300 group-hover:text-stone-400"
const HORIZONTAL_LINE_STROKE = "-mx-8 stroke-2 text-stone-300 transition-colors duration-300 group-hover:text-stone-400"

export default function SkateboardProduct({ id }: Props) {
    const [skateboard, setSkateboard] = useState<Content.SkateboardDocument | null>(null);
    const [dominantColor, setDominantColor] = useState<string | undefined>(undefined);

    useEffect(() => {
        async function fetchData() {
            const client = createClient();
            const data = await client.getByID<Content.SkateboardDocument>(id);
            setSkateboard(data);
            
            if (isFilled.image(data.data.image)) {
                const color = await getDominantColor(data.data.image.url);
                setDominantColor(color);
            }
        }
        fetchData();
    }, [id]);

    if (!skateboard) return <div>Loading...</div>;

    const price = isFilled.number(skateboard.data.price) 
    ? `$${(skateboard.data.price / 100).toFixed(2)}` : "Price Not Available"
  return (
    <div className='group relative mx-auto w-full max-w-72 px-8'>

        <HorizontalLine className= {HORIZONTAL_LINE_STROKE}  />
        <VerticalLine className={clsx(VERTICAL_LINE_STROKE, "left-4")}  />
        <VerticalLine className={clsx(VERTICAL_LINE_STROKE, "right-4")}  />



        <div className='flex items-center justify-between ~text-sm/2xl'>
            <span className="flex-shrink-0">{price}</span>
            <span className="inline-flex items-center gap-1 flex-shrink-0">
                <FaStar className='text-yellow-400' />47
            </span>
        </div>
        <div className='-mb-1 overflow-hidden py-4 flex justify-center'>
        <Scribble className='absolute inset-0 h-full w-full' color={dominantColor} />
        <PrismicNextImage alt="" field={skateboard.data.image} 
        width = {150}
        className='mx-auto w-[58%] origin-top transform-gpu 
        transition-transform duration-500 group-hover:scale-150'  />
        </div>
        <HorizontalLine className= {HORIZONTAL_LINE_STROKE}  />
        <h3 className='my-2 text-center ~text-base/lg leading-tight 
        ~text-lg/xl font-bowlby'>
            {skateboard.data.name}
            
        </h3>
        <div className='flex justify-center opacity-0 absolute inset-0 items-center transition-opacity duration-200 group-hover:opacity-100'>
            <ButtonLink field={skateboard.data.customizer_link}>
                Customize
            </ButtonLink>
        </div>
    </div>
  )
}