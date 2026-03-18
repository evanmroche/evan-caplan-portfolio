export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center py-24 md:py-32 px-6 text-center">
      <h1 className="font-display text-7xl sm:text-8xl md:text-9xl tracking-wider text-foreground animate-fade-up">
        Evan Caplan
      </h1>
      <p className="mt-4 text-lg md:text-xl text-muted-foreground tracking-widest uppercase animate-fade-up animate-delay-200">
        Video Editor &middot; Graphic Designer
      </p>
      <div className="mt-8 h-px w-24 bg-primary/50 animate-fade-in animate-delay-400" />
    </section>
  );
}
