"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Play } from "lucide-react";

import { useIntersection } from "@/hooks/use-intersection";
import { cn } from "@/lib/utils";

type LoopingVideoProps = {
  src: string;
  posterSrc: string;
  title: string;
  vertical?: boolean;
  priority?: boolean;
};

export function LoopingVideo({
  src,
  posterSrc,
  title,
  vertical = false,
  priority = false,
}: LoopingVideoProps) {
  const { ref, isVisible } = useIntersection({ rootMargin: "400px 0px" });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isVisible) return;
    const el = videoRef.current;
    if (!el) return;
    const result = el.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  }, [isVisible]);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative mx-auto overflow-hidden rounded-md border border-border/60 bg-black",
        vertical ? "aspect-[9/16] max-w-xs" : "aspect-video w-full",
      )}
    >
      <Image
        src={posterSrc}
        alt={title}
        fill
        sizes={
          vertical
            ? "(max-width: 768px) 80vw, 320px"
            : "(max-width: 768px) 100vw, 50vw"
        }
        priority={priority}
        className="object-cover"
      />
      {isVisible && (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload={priority ? "auto" : "metadata"}
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <div className="mb-6 flex items-center gap-3 text-foreground">
          <Play className="size-5 fill-current" />
          <span className="font-display text-lg tracking-wider uppercase">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}
