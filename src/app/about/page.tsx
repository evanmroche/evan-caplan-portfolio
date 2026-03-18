export default function AboutPage() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-3xl mx-auto">
      <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wider text-foreground animate-fade-up">
        About
      </h1>
      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed animate-fade-up animate-delay-200">
        <p>
          I&apos;m Evan Caplan — a video editor and graphic designer originally
          from Los Angeles, currently finishing my senior year at the University
          of Colorado Boulder.
        </p>
        <p>
          With over 4 years of experience, I specialize in cinematic
          storytelling, brand design, and turning creative ideas into
          compelling visual narratives. Whether it&apos;s a short film, a brand
          identity, or a social campaign, I bring attention to detail and a
          passion for the craft.
        </p>
        <p>
          When I&apos;m not editing or designing, you&apos;ll find me exploring
          the mountains, shooting on film, or hunting for the perfect coffee
          spot.
        </p>
      </div>
      <div className="mt-8 h-px w-24 bg-primary/50 animate-fade-in animate-delay-400" />
    </section>
  );
}
