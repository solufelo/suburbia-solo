"use client";

import React from "react";
import { BoardBuilder } from "@/components/BoardBuilder";
import Preview from "./Preview";
import Link from "next/link";

export default function BuildPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* 3D Preview Section */}
      <div className="relative aspect-square shrink-0 bg-[#3a414a] lg:aspect-auto lg:grow">
        <div className="absolute inset-0">
          <Preview />
        </div>

        <Link 
          href="/" 
          className="absolute left-6 top-6 z-50 text-white hover:text-zinc-300 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Controls Section */}
      <div className="grow bg-texture bg-zinc-900 text-white p-6 lg:w-96 lg:shrink-0 lg:grow-0">
        <h1 className="text-2xl font-bold mb-6">
          Build your board
        </h1>
        
        <BoardBuilder />
      </div>
    </div>
  );
}
