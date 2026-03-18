"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useIntersection } from "@/hooks/use-intersection";
import { cn } from "@/lib/utils";

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Vimeo", href: "https://vimeo.com" },
];

export function SplitSection() {
  const { ref, isVisible } = useIntersection();

  return (
    <section
      ref={ref}
      className="px-6 md:px-10 py-16 md:py-24 border-t border-border/30"
    >
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto",
          isVisible ? "animate-fade-up" : "opacity-0"
        )}
      >
        {/* Left: Bio + socials */}
        <div className="flex flex-col justify-center">
          <h2 className="font-display text-4xl md:text-5xl tracking-wide mb-4">
            Let&apos;s Create
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
            Based in Los Angeles and currently a senior at CU Boulder, I bring
            4+ years of experience in video editing and graphic design to every
            project. I turn ideas into cinematic stories.
          </p>

          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-border/50 hover:border-primary/50 hover:text-primary transition-all"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right: Portfolio CTAs */}
        <div className="flex flex-col gap-4 justify-center">
          <Link
            href="/video-projects"
            className="group block p-6 rounded-lg border border-border/30 bg-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-5px] hover:shadow-primary/10 transition-all duration-300"
          >
            <span className="font-display text-2xl tracking-wide text-foreground group-hover:text-primary transition-colors">
              Video Projects
            </span>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore my film and editing work
            </p>
          </Link>
          <Link
            href="/graphic-design"
            className="group block p-6 rounded-lg border border-border/30 bg-card hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-5px] hover:shadow-primary/10 transition-all duration-300"
          >
            <span className="font-display text-2xl tracking-wide text-foreground group-hover:text-primary transition-colors">
              Graphic Design
            </span>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse my visual design portfolio
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
