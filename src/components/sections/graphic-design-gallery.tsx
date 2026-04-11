"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";
import { cn } from "@/lib/utils";

export type GraphicDesignImage = {
  slug: string;
  src: string;
  width: number;
  height: number;
  alt: string;
};

type Props = {
  images: GraphicDesignImage[];
};

export function GraphicDesignGallery({ images }: Props) {
  const { ref, isVisible } = useIntersection({ threshold: 0 });
  const [selected, setSelected] = useState<number | null>(null);

  const close = useCallback(() => setSelected(null), []);
  const next = useCallback(
    () => setSelected((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length],
  );
  const prev = useCallback(
    () =>
      setSelected((i) =>
        i === null ? i : (i - 1 + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [selected, close, next, prev]);

  const active = selected !== null ? images[selected] : null;

  return (
    <>
      <div
        ref={ref}
        className={cn(
          "px-6 md:px-10 max-w-7xl mx-auto",
          "columns-1 sm:columns-2 md:columns-3 gap-4 md:gap-6",
          "transition-opacity duration-700",
          isVisible ? "opacity-100" : "opacity-0",
        )}
      >
        {images.map((img, i) => (
          <button
            key={img.slug}
            type="button"
            onClick={() => setSelected(i)}
            className={cn(
              "mb-4 md:mb-6 block w-full break-inside-avoid cursor-zoom-in",
              "overflow-hidden rounded-sm border border-border/40 bg-card/40",
              "transition-all duration-300",
              "hover:scale-[1.01] hover:border-primary/50",
              "hover:shadow-[0_0_30px_-8px] hover:shadow-primary/30",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
            )}
            aria-label={`Open ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="w-full h-auto block"
              loading={i < 6 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4 md:p-10"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-background/60 border border-border/50 text-foreground hover:bg-background hover:border-primary/60 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/60 border border-border/50 text-foreground hover:bg-background hover:border-primary/60 transition"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/60 border border-border/50 text-foreground hover:bg-background hover:border-primary/60 transition"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-[90vw] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={active.alt}
              width={active.width}
              height={active.height}
              sizes="90vw"
              className="max-h-[90vh] w-auto h-auto object-contain"
              priority
            />
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs md:text-sm text-muted-foreground font-mono tracking-wider uppercase">
            {active.alt}
          </p>
        </div>
      )}
    </>
  );
}
