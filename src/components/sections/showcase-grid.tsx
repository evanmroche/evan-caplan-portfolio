"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useIntersection } from "@/hooks/use-intersection";
import { cn } from "@/lib/utils";

const showcaseItems = [
  {
    title: "Video Projects",
    description: "Short films, commercials, and cinematic edits",
    href: "/video-projects",
    gradient: "from-primary/20 to-transparent",
  },
  {
    title: "Graphic Design",
    description: "Brand identities, posters, and digital art",
    href: "/graphic-design",
    gradient: "from-primary/15 via-transparent to-primary/10",
  },
  {
    title: "About Me",
    description: "The story behind the lens and the screen",
    href: "/about",
    gradient: "from-transparent to-primary/20",
  },
];

export function ShowcaseGrid() {
  const { ref, isVisible } = useIntersection();

  return (
    <section ref={ref} className="px-6 md:px-10 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {showcaseItems.map((item, i) => (
          <Link key={item.href} href={item.href} className="group">
            <Card
              className={cn(
                "relative overflow-hidden border-border/50 bg-card transition-all duration-300",
                "hover:scale-[1.02] hover:border-primary/40 hover:shadow-[0_0_30px_-5px] hover:shadow-primary/20",
                isVisible
                  ? "animate-fade-up"
                  : "opacity-0"
              )}
              style={{
                animationDelay: isVisible ? `${i * 150}ms` : undefined,
              }}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <CardContent className="relative z-10 p-8 md:p-10">
                <div className="aspect-[4/3] flex flex-col justify-end">
                  <h3 className="font-display text-3xl md:text-4xl tracking-wide text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
