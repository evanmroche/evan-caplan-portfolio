"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";
import { cn } from "@/lib/utils";

type NavItem = {
  number: string;
  title: string;
  href: string;
};

const navItems: NavItem[] = [
  { number: "01", title: "Video Projects", href: "/video-projects" },
  { number: "02", title: "Graphic Design", href: "/graphic-design" },
  { number: "03", title: "About Me", href: "/about" },
];

const smpteBars = [
  "bg-smpte-white",
  "bg-smpte-yellow",
  "bg-smpte-cyan",
  "bg-smpte-green",
  "bg-smpte-magenta",
  "bg-smpte-red",
  "bg-smpte-blue",
];

export function Hero() {
  const { ref, isVisible } = useIntersection({ threshold: 0.05 });

  return (
    <section
      ref={ref}
      className="min-h-[calc(100svh-4.5rem)] px-6 md:px-10 py-16 md:py-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 max-w-7xl mx-auto h-full min-h-[calc(100svh-8rem)]">
        {/* Left: title block */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <h1
            className={cn(
              "font-display text-[clamp(4rem,13vw,11rem)] leading-[0.85] tracking-tight text-foreground",
              isVisible ? "animate-fade-up" : "opacity-0"
            )}
          >
            <span className="block">Evan</span>
            <span className="block">Caplan</span>
          </h1>

          <div
            className={cn(
              "mt-8 h-px w-24 bg-primary/50",
              isVisible ? "animate-fade-in animate-delay-200" : "opacity-0"
            )}
          />

          <p
            className={cn(
              "mt-6 font-mono text-xs md:text-sm uppercase tracking-[0.25em] text-muted-foreground",
              isVisible ? "animate-fade-up animate-delay-200" : "opacity-0"
            )}
          >
            Video Editor / Graphic Designer
          </p>
          <p
            className={cn(
              "mt-2 font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground/70",
              isVisible ? "animate-fade-up animate-delay-300" : "opacity-0"
            )}
          >
            Los Angeles · 2026
          </p>

          <div
            className={cn(
              "mt-10 flex h-1.5 w-40 overflow-hidden",
              isVisible ? "animate-fade-in animate-delay-400" : "opacity-0"
            )}
            aria-hidden
          >
            {smpteBars.map((color) => (
              <span key={color} className={cn("flex-1", color)} />
            ))}
          </div>
        </div>

        {/* Right: numbered nav rows */}
        <nav
          aria-label="Primary"
          className="md:col-span-7 flex flex-col justify-center md:border-l md:border-border/30 md:pl-12 lg:pl-16"
        >
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-baseline gap-5 md:gap-8 py-6 md:py-8 border-b border-border/20 last:border-b-0 overflow-hidden transition-colors",
                isVisible ? "animate-fade-up" : "opacity-0"
              )}
              style={{
                animationDelay: isVisible ? `${300 + i * 120}ms` : undefined,
              }}
            >
              <span className="pointer-events-none absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.06] transition-colors duration-500" />

              <span className="relative font-mono text-xs md:text-sm text-muted-foreground group-hover:text-primary transition-colors">
                {item.number}
              </span>

              <span className="relative h-px w-8 bg-border/60 self-center group-hover:w-16 group-hover:bg-primary transition-all duration-500" />

              <span className="relative font-display text-4xl md:text-6xl lg:text-7xl tracking-wide text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </span>

              <ArrowRight
                aria-hidden
                className="relative ml-auto self-center h-5 w-5 md:h-6 md:w-6 text-muted-foreground transition-all duration-300 group-hover:translate-x-2 group-hover:text-primary"
              />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
