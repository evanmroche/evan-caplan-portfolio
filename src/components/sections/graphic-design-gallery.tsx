"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeriesStack } from "./series-stack";

export type GraphicDesignImage = {
  slug: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL: string;
  seriesId?: string;
  avgColor?: { hex: string; lab: [number, number, number] };
  meanChroma?: number;
  isBw?: boolean;
};

type GalleryItem =
  | { kind: "image"; image: GraphicDesignImage; idx: number }
  | { kind: "series"; id: string; images: GraphicDesignImage[]; anchor: number }
  | {
      kind: "seriesMember";
      id: string;
      image: GraphicDesignImage;
      position: number;
      total: number;
      series: GraphicDesignImage[];
      isFirst: boolean;
    };

type LightboxState = { list: GraphicDesignImage[]; index: number };

const ROW_UNIT = 8;

type Metrics = { cols: number; gap: number; colWidth: number };

function groupItems(
  images: GraphicDesignImage[],
  expandedId: string | null,
): GalleryItem[] {
  const bySeries = new Map<string, GraphicDesignImage[]>();
  for (const img of images) {
    if (!img.seriesId) continue;
    const list = bySeries.get(img.seriesId);
    if (list) list.push(img);
    else bySeries.set(img.seriesId, [img]);
  }

  const placed = new Set<string>();
  const out: GalleryItem[] = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (placed.has(img.slug)) continue;
    if (img.seriesId) {
      const group = bySeries.get(img.seriesId);
      if (group && group.length >= 2) {
        if (expandedId === img.seriesId) {
          group.forEach((m, pi) => {
            out.push({
              kind: "seriesMember",
              id: img.seriesId!,
              image: m,
              position: pi,
              total: group.length,
              series: group,
              isFirst: pi === 0,
            });
            placed.add(m.slug);
          });
        } else {
          out.push({
            kind: "series",
            id: img.seriesId,
            images: group,
            anchor: i,
          });
          for (const m of group) placed.add(m.slug);
        }
        continue;
      }
    }
    out.push({ kind: "image", image: img, idx: i });
    placed.add(img.slug);
  }
  return out;
}

function rowSpanForHeight(heightPx: number, gap: number): number {
  return Math.max(1, Math.ceil((heightPx + gap) / (ROW_UNIT + gap)));
}

type Props = { images: GraphicDesignImage[] };

export function GraphicDesignGallery({ images }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    cols: 1,
    gap: 16,
    colWidth: 300,
  });

  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasToggled, setHasToggled] = useState(false);

  const seriesAnchorsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const pendingAnchorRef = useRef<
    { seriesId: string; startTop: number } | null
  >(null);

  const registerSeriesAnchor = useCallback(
    (seriesId: string, el: HTMLDivElement | null) => {
      const map = seriesAnchorsRef.current;
      if (el) map.set(seriesId, el);
      else if (map.get(seriesId)) map.delete(seriesId);
    },
    [],
  );

  const items = useMemo(
    () => groupItems(images, expandedId),
    [images, expandedId],
  );

  const toggleExpanded = useCallback(
    (next: string | null, anchorId: string | null) => {
      if (anchorId) {
        const el = seriesAnchorsRef.current.get(anchorId);
        if (el) {
          pendingAnchorRef.current = {
            seriesId: anchorId,
            startTop: el.getBoundingClientRect().top,
          };
        }
      }
      const apply = () => {
        setExpandedId(next);
        setHasToggled(true);
      };
      const doc = typeof document !== "undefined"
        ? (document as Document & { startViewTransition?: (cb: () => void) => void })
        : null;
      const reduce = typeof window !== "undefined"
        && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (doc?.startViewTransition && !reduce) {
        doc.startViewTransition(apply);
      } else {
        apply();
      }
    },
    [],
  );

  useLayoutEffect(() => {
    const pending = pendingAnchorRef.current;
    if (!pending) return;
    const el = seriesAnchorsRef.current.get(pending.seriesId);
    if (!el) {
      pendingAnchorRef.current = null;
      return;
    }
    const delta = el.getBoundingClientRect().top - pending.startTop;
    if (delta !== 0) window.scrollBy(0, delta);
    pendingAnchorRef.current = null;
  }, [expandedId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0 },
    );
    io.observe(el);

    const update = () => {
      const w = el.clientWidth;
      const cols = window.matchMedia("(min-width: 1024px)").matches
        ? 4
        : window.matchMedia("(min-width: 768px)").matches
          ? 3
          : window.matchMedia("(min-width: 640px)").matches
            ? 2
            : 1;
      const gap = window.matchMedia("(min-width: 768px)").matches ? 24 : 16;
      const colWidth =
        cols > 0 ? Math.max(1, (w - (cols - 1) * gap) / cols) : w;
      setMetrics({ cols, gap, colWidth });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const openLightbox = useCallback(
    (list: GraphicDesignImage[], index: number) => {
      setLightbox({ list, index });
    },
    [],
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const nextLightbox = useCallback(
    () =>
      setLightbox((s) =>
        s ? { ...s, index: (s.index + 1) % s.list.length } : s,
      ),
    [],
  );
  const prevLightbox = useCallback(
    () =>
      setLightbox((s) =>
        s
          ? { ...s, index: (s.index - 1 + s.list.length) % s.list.length }
          : s,
      ),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox) {
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowRight") nextLightbox();
        else if (e.key === "ArrowLeft") prevLightbox();
      } else if (expandedId) {
        if (e.key === "Escape") toggleExpanded(null, expandedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, expandedId, closeLightbox, nextLightbox, prevLightbox, toggleExpanded]);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const active = lightbox ? lightbox.list[lightbox.index] : null;

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "px-6 md:px-10 max-w-7xl mx-auto",
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          "gap-4 md:gap-6 [grid-auto-rows:8px]",
          "[overflow-anchor:none]",
          "transition-opacity duration-700",
          isVisible ? "opacity-100" : "opacity-0",
        )}
      >
        {items.map((item) => {
          if (item.kind === "image") {
            const img = item.image;
            const itemHeight = metrics.colWidth * (img.height / img.width);
            return (
              <button
                key={img.slug}
                type="button"
                onClick={() => openLightbox(images, item.idx)}
                style={{
                  gridRowEnd: `span ${rowSpanForHeight(itemHeight, metrics.gap)}`,
                  alignSelf: "start",
                }}
                className={cn(
                  "block w-full cursor-zoom-in overflow-hidden rounded-sm",
                  "border border-border/40 bg-card/40",
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
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 48vw, 96vw"
                  className="w-full h-auto block"
                  placeholder="blur"
                  blurDataURL={img.blurDataURL}
                  loading={item.idx < 3 ? "eager" : "lazy"}
                  fetchPriority={item.idx === 0 ? "high" : undefined}
                />
              </button>
            );
          }

          if (item.kind === "series") {
            const top = item.images[0];
            const itemHeight = metrics.colWidth * (top.height / top.width);
            return (
              <div
                key={`series-${item.id}`}
                ref={(el) => registerSeriesAnchor(item.id, el)}
                style={{
                  gridRowEnd: `span ${rowSpanForHeight(itemHeight, metrics.gap)}`,
                  alignSelf: "start",
                }}
                className={hasToggled ? "animate-gd-settle" : undefined}
              >
                <SeriesStack
                  id={item.id}
                  images={item.images}
                  expanded={false}
                  onExpand={() => toggleExpanded(item.id, item.id)}
                  priority={item.anchor < 3}
                />
              </div>
            );
          }

          const m = item.image;
          const memberHeight = metrics.colWidth * (m.height / m.width);
          const seriesLabel = item.id.replace(/-/g, " ");
          return (
            <div
              key={`member-${m.slug}`}
              ref={item.isFirst ? (el) => registerSeriesAnchor(item.id, el) : undefined}
              style={{
                gridRowEnd: `span ${rowSpanForHeight(memberHeight, metrics.gap)}`,
                alignSelf: "start",
                ["--gd-idx" as string]: String(item.position),
              } as CSSProperties}
              className="relative animate-gd-reveal"
            >
              <button
                type="button"
                onClick={() => openLightbox(item.series, item.position)}
                className={cn(
                  "block w-full cursor-zoom-in overflow-hidden rounded-sm",
                  "border-2 border-primary/60 bg-card/40",
                  "transition-all duration-300",
                  "hover:scale-[1.01] hover:border-primary",
                  "hover:shadow-[0_0_30px_-8px] hover:shadow-primary/40",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                )}
                aria-label={`Open ${m.alt} — ${seriesLabel} ${item.position + 1} of ${item.total}`}
              >
                <Image
                  src={m.src}
                  alt={m.alt}
                  width={m.width}
                  height={m.height}
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, (min-width: 640px) 48vw, 96vw"
                  className="w-full h-auto block"
                  placeholder="blur"
                  blurDataURL={m.blurDataURL}
                />
              </button>
              <span
                className={cn(
                  "pointer-events-none absolute top-2 left-2 z-10 px-2 py-1",
                  "text-[10px] font-mono uppercase tracking-wider",
                  "bg-background/80 border border-primary/50 text-foreground",
                  "backdrop-blur-sm rounded-sm",
                )}
                aria-hidden
              >
                {seriesLabel}
                <span className="text-foreground/40"> · </span>
                {item.position + 1}/{item.total}
              </span>
              {item.isFirst && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(null, item.id);
                  }}
                  className={cn(
                    "absolute top-2 right-2 z-10 p-1.5 rounded-full",
                    "bg-background/80 border border-primary/50 text-foreground",
                    "backdrop-blur-sm transition",
                    "hover:bg-background hover:border-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  )}
                  aria-label={`Collapse ${seriesLabel} series`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4 md:p-10"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
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
              prevLightbox();
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
              nextLightbox();
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
              placeholder="blur"
              blurDataURL={active.blurDataURL}
              preload
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
