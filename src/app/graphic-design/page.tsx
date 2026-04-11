import type { Metadata } from "next";
import { GraphicDesignGallery, type GraphicDesignImage } from "@/components/sections/graphic-design-gallery";
import images from "./images.json";

export const metadata: Metadata = {
  title: "Graphic Design — Evan Caplan",
  description: "Posters, collages, and digital art by Evan Caplan.",
};

export default function GraphicDesignPage() {
  return (
    <section className="py-20 md:py-28">
      <header className="px-6 md:px-10 mb-12 md:mb-16 text-center">
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wider text-foreground animate-fade-up">
          Graphic Design
        </h1>
        <div className="mt-6 mx-auto h-px w-24 bg-primary/50 animate-fade-in animate-delay-400" />
      </header>
      <GraphicDesignGallery images={images as GraphicDesignImage[]} />
    </section>
  );
}
