import type { Metadata } from "next";
import { DeckGrid } from "@/components/sections/deck-grid";
import type { DeckSection } from "@/components/sections/deck-viewer";
import decks from "./decks.json";

export const metadata: Metadata = {
  title: "Graphic Design — Evan Caplan",
  description: "Campaigns, illustration, and label design by Evan Caplan.",
};

const sections = decks as DeckSection[];

export default function GraphicDesignPage() {
  return (
    <section className="py-20 md:py-28">
      <header className="px-6 md:px-10 mb-16 md:mb-20 text-center">
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wider text-foreground animate-fade-up">
          Graphic Design
        </h1>
        <div className="mt-6 mx-auto h-px w-24 bg-primary/50 animate-fade-in animate-delay-400" />
      </header>

      <div className="px-6 md:px-10 max-w-7xl mx-auto space-y-20 md:space-y-28">
        {sections.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="scroll-mt-24 animate-fade-up"
            style={{ animationDelay: `${200 + i * 120}ms` }}
          >
            <div className="mb-8 md:mb-10 flex items-baseline gap-5 md:gap-8 border-b border-border/20 pb-4">
              <span className="font-mono text-xs md:text-sm text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="h-px w-8 self-center bg-border/60" aria-hidden />
              <h2
                id={`${section.id}-heading`}
                className="font-display text-4xl md:text-5xl tracking-wide text-foreground"
              >
                {section.title}
              </h2>
            </div>
            <DeckGrid decks={section.decks} eagerCount={i === 0 ? 3 : 0} />
          </section>
        ))}
      </div>
    </section>
  );
}
