"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GraphicDesignImage } from "./graphic-design-gallery";

type Props = {
  id: string;
  images: GraphicDesignImage[];
  onExpand: () => void;
  expanded: boolean;
  priority?: boolean;
};

const SIZES =
  "(min-width: 1024px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 48vw, 96vw";

export function SeriesStack({ id, images, onExpand, expanded, priority }: Props) {
  const top = images[0];
  const midPeek = images[1];
  const backPeek = images[2] ?? images[1];
  const showBack = images.length >= 3;

  return (
    <button
      type="button"
      onClick={onExpand}
      aria-expanded={expanded}
      aria-label={`Expand ${id} series, ${images.length} pieces`}
      className={cn(
        "group relative block w-full cursor-pointer rounded-sm",
        "transition-transform duration-300",
        "hover:scale-[1.01]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      )}
      style={{ aspectRatio: `${top.width} / ${top.height}` }}
    >
      {showBack && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 block overflow-hidden rounded-sm",
            "border border-border/40 bg-card/40",
            "origin-center opacity-70 brightness-[0.85]",
            "transition-transform duration-300 ease-out",
            "-translate-x-[10px] -translate-y-[8px] -rotate-[3deg]",
            "group-hover:-translate-x-[14px] group-hover:-translate-y-[12px] group-hover:-rotate-[5deg]",
            "motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:rotate-0",
          )}
        >
          <Image
            src={backPeek.src}
            alt=""
            fill
            sizes={SIZES}
            className="object-cover"
            placeholder="blur"
            blurDataURL={backPeek.blurDataURL}
          />
        </span>
      )}

      <span
        aria-hidden
        className={cn(
          "absolute inset-0 block overflow-hidden rounded-sm",
          "border border-border/40 bg-card/40",
          "origin-center opacity-90 brightness-[0.95]",
          "transition-transform duration-300 ease-out",
          "translate-x-[8px] translate-y-[6px] rotate-[2.5deg]",
          "group-hover:translate-x-[12px] group-hover:translate-y-[10px] group-hover:rotate-[4deg]",
          "motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:rotate-0",
        )}
      >
        <Image
          src={midPeek.src}
          alt=""
          fill
          sizes={SIZES}
          className="object-cover"
          placeholder="blur"
          blurDataURL={midPeek.blurDataURL}
        />
      </span>

      <span
        className={cn(
          "absolute inset-0 block overflow-hidden rounded-sm",
          "border border-border/40 bg-card/40",
          "transition-all duration-300",
          "group-hover:border-primary/50",
          "group-hover:shadow-[0_0_30px_-8px] group-hover:shadow-primary/30",
        )}
      >
        <Image
          src={top.src}
          alt={top.alt}
          fill
          sizes={SIZES}
          className="object-cover"
          placeholder="blur"
          blurDataURL={top.blurDataURL}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
        />
      </span>

      <span
        className={cn(
          "absolute bottom-2 right-2 z-30 px-2 py-1",
          "text-[10px] font-mono uppercase tracking-wider",
          "bg-background/80 border border-border/50 text-muted-foreground",
          "backdrop-blur-sm rounded-sm",
        )}
        aria-hidden
      >
        {images.length} pieces
      </span>
    </button>
  );
}
