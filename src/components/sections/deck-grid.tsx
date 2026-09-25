"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { DECK_TRANSITION_NAME, DeckViewer, type Deck } from "./deck-viewer";

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

const SIZES = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw";

function canAnimate(doc: ViewTransitionDocument) {
  return (
    typeof doc.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// A second click or Escape during a transition would start another one, which
// skips the first and rejects its `ready` promise.
function whenTransitionDone(
  transition: { ready: Promise<void>; finished: Promise<void> },
  done: () => void,
) {
  transition.ready.catch(() => {});
  transition.finished.finally(done);
}

type Props = {
  decks: Deck[];
  /** How many leading covers load eagerly (only worth it above the fold). */
  eagerCount?: number;
};

export function DeckGrid({ decks, eagerCount = 0 }: Props) {
  const [openState, setOpenState] = useState<{
    slug: string;
    settled?: Promise<void>;
  } | null>(null);
  const openSlug = openState?.slug ?? null;
  const coverRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const transitioning = useRef(false);
  const openDeck = decks.find((d) => d.slug === openSlug) ?? null;

  const open = useCallback((slug: string) => {
    if (transitioning.current) return;
    const doc = document as ViewTransitionDocument;
    const cover = coverRefs.current.get(slug);
    if (!canAnimate(doc) || !cover) {
      setOpenState({ slug });
      return;
    }
    transitioning.current = true;
    cover.style.setProperty("view-transition-name", DECK_TRANSITION_NAME);
    // The callback runs after startViewTransition returns, so `transition` is set.
    const transition = doc.startViewTransition!(() => {
      cover.style.removeProperty("view-transition-name");
      flushSync(() => setOpenState({ slug, settled: transition.finished }));
    });
    whenTransitionDone(transition, () => {
      transitioning.current = false;
    });
  }, []);

  const close = useCallback(
    (atFirstSlide: boolean) => {
      if (transitioning.current) return;
      const doc = document as ViewTransitionDocument;
      const cover = openSlug ? coverRefs.current.get(openSlug) : undefined;
      if (!canAnimate(doc)) {
        setOpenState(null);
        return;
      }
      transitioning.current = true;
      // Only morph back into the cover from the first slide; from any other
      // slide the viewer simply cross-fades out.
      const transition = doc.startViewTransition!(() => {
        flushSync(() => setOpenState(null));
        if (atFirstSlide) cover?.style.setProperty("view-transition-name", DECK_TRANSITION_NAME);
      });
      whenTransitionDone(transition, () => {
        cover?.style.removeProperty("view-transition-name");
        transitioning.current = false;
      });
    },
    [openSlug],
  );

  return (
    <>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
        {decks.map((deck, i) => (
          <li key={deck.slug}>
            <button
              type="button"
              onClick={() => open(deck.slug)}
              className="group block w-full text-left focus-visible:outline-none"
              aria-label={`Open ${deck.title}, ${deck.slides.length} slides`}
            >
              <span
                ref={(el) => {
                  if (el) coverRefs.current.set(deck.slug, el);
                  else coverRefs.current.delete(deck.slug);
                }}
                className={cn(
                  "relative block aspect-video overflow-hidden rounded-sm",
                  "border border-border/40 bg-card/40",
                  "transition-all duration-300 ease-out",
                  "group-hover:scale-[1.03] group-hover:border-primary/50",
                  "group-hover:shadow-[0_0_30px_-8px] group-hover:shadow-primary/30",
                  "group-focus-visible:ring-2 group-focus-visible:ring-primary/60",
                  "motion-reduce:group-hover:scale-100",
                )}
              >
                <Image
                  src={deck.cover.src}
                  alt=""
                  fill
                  sizes={SIZES}
                  className="object-contain"
                  placeholder="blur"
                  blurDataURL={deck.cover.blurDataURL}
                  loading={i < eagerCount ? "eager" : "lazy"}
                />
              </span>
              <span className="mt-4 flex items-baseline justify-between gap-4">
                <span className="font-display text-xl tracking-wide text-foreground transition-colors group-hover:text-primary md:text-2xl">
                  {deck.title}
                </span>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {deck.slides.length} slides
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openDeck && (
        <DeckViewer deck={openDeck} onClose={close} scrollLockAfter={openState?.settled} />
      )}
    </>
  );
}
