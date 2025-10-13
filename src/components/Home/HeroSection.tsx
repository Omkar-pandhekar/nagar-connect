"use client";

import Image from "next/image";
import { Button } from "../ui/button";

export default function HeroSection() {
  return (
    <section className="relative isolate mt-24">
      <div className="relative h-[60vh] sm:h-[70vh] w-full">
        <Image
          src="/Cover.jpg"
          alt="City of Chhatrapati Sambhajinagar"
          fill
          priority
          quality={100}
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Our City, Our Voice, Our Future.
            </h1>
            <p className="mt-4 text-white/90 text-base sm:text-lg md:text-xl">
              Report civic issues in Chhatrapati Sambhajinagar instantly. See
              them get resolved.
            </p>
            <div className="mt-6">
              <Button className="px-5 py-5 font-semibold bg-blue-600 hover:bg-blue-500">
                Report an Issue Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
