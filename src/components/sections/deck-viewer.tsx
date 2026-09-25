"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeckSlide =
  | { type: "image"; src: string; width: number; height: number }
  | { type: "video"; src: string; poster: string; width: number; height: number };

export type Deck = {
  slug: string;
  title: string;
  cover: { src: string; width: number; height: number; blurDataURL: string };
  slides: DeckSlide[];
};

export type DeckSection = { id: string; title: string; decks: Deck[] };

// Shared with DeckGrid so the cover morphs into the first slide on open.
export const DECK_TRANSITION_NAME = "deck-expand";

type Props = {
  deck: Deck;
  onClose: (atFirstSlide: boolean) => void;
  scrollLockAfter?: Promise<unknown>;
};

const navButtonClass = cn(
  "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full p-2 md:flex",
  "border border-border/50 bg-background/60 text-foreground backdrop-blur-sm transition",
  "hover:border-primary/60 hover:bg-background",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
  "disabled:pointer-events-none disabled:opacity-0",
);

export function DeckViewer({ deck, onClose, scrollLockAfter }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  // Where the track is heading. `index` trails it during a smooth scroll, so
  // rapid arrow presses step from here instead.
  const targetRef = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [index, setIndex] = useState(0);
  const total = deck.slides.length;

  const goTo = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(next, track.children.length - 1));
    targetRef.current = clamped;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: clamped * track.clientWidth,
      behavior: reduce ? "auto" : "smooth",
    });
  }, []);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const current = Math.round(track.scrollLeft / track.clientWidth);
    setIndex(current);
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      targetRef.current = current;
    }, 150);
  }, []);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const opener = document.activeElement as HTMLElement | null;
    let active = true;
    let unlock: (() => void) | undefined;
    const lock = () => {
      if (!active) return;
      const prevHtml = html.style.overflow;
      const prevBody = body.style.overflow;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      unlock = () => {
        html.style.overflow = prevHtml;
        body.style.overflow = prevBody;
      };
    };
    // Removing the page scrollbar while the open view transition runs changes
    // the viewport size, which aborts the transition. Lock once it settles.
    if (scrollLockAfter) scrollLockAfter.then(lock, lock);
    else lock();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      active = false;
      unlock?.();
      opener?.focus({ preventScroll: true });
    };
  }, [scrollLockAfter]);

  // Keep the current slide in place when the viewport resizes or rotates.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(() => {
      track.scrollLeft = Math.round(track.scrollLeft / track.clientWidth) * track.clientWidth;
    });
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose(index === 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(targetRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(targetRef.current - 1);
      } else if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo, onClose]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (i === index) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [index]);

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={deck.title}
      className="fixed inset-0 z-[70] bg-background"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={() => onClose(index === 0)}
        className={cn(
          "absolute top-3 left-3 z-10 rounded-full p-1.5 md:top-5 md:left-5",
          "border border-border/50 bg-background/60 text-foreground backdrop-blur-sm transition",
          "hover:border-primary/60 hover:bg-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        )}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={-1}
        className={cn(
          "flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-contain",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {deck.slides.map((slide, i) => {
          const label = `${deck.title} — slide ${i + 1} of ${total}`;
          return (
            <div
              key={slide.src}
              className="flex h-full w-full shrink-0 snap-center items-center justify-center px-3 pt-14 pb-16 md:px-20 md:pt-16 md:pb-20"
              aria-hidden={i !== index}
            >
              <div
                className="relative h-full w-full"
                style={
                  i === 0 && index === 0
                    ? { viewTransitionName: DECK_TRANSITION_NAME }
                    : undefined
                }
              >
                {slide.type === "video" ? (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(i, el);
                      else videoRefs.current.delete(i);
                    }}
                    src={slide.src}
                    poster={slide.poster}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                    aria-label={label}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    src={slide.src}
                    alt={label}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    draggable={false}
                    {...(i === 0
                      ? { placeholder: "blur" as const, blurDataURL: deck.cover.blurDataURL, preload: true }
                      : { loading: Math.abs(i - index) <= 1 ? ("eager" as const) : ("lazy" as const) })}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => goTo(targetRef.current - 1)}
        disabled={index === 0}
        className={cn(navButtonClass, "left-4 md:left-6")}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => goTo(targetRef.current + 1)}
        disabled={index === total - 1}
        className={cn(navButtonClass, "right-4 md:right-6")}
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-5 md:pb-7">
        <div className="mx-auto flex max-w-3xl items-baseline justify-between gap-6 font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:text-xs">
          <span className="truncate">{deck.title}</span>
          <span aria-live="polite" className="shrink-0 tabular-nums text-foreground">
            {String(index + 1).padStart(2, "0")}
            <span className="text-foreground/40"> / </span>
            {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="mx-auto mt-3 h-px max-w-3xl bg-border/60" aria-hidden>
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
