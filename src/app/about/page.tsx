const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/obsk.ura/" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/evan-caplan-040104251/",
  },
  { label: "Vimeo", href: "https://vimeo.com/user254547779?fl=pp&fe=sh" },
];

const socialButtonClass =
  "inline-flex items-center justify-center h-7 px-2.5 text-[0.8rem] font-medium rounded-[min(var(--radius-md),12px)] border border-border/50 bg-background text-foreground transition-all hover:border-primary/50 hover:text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

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
          storytelling, brand design, and turning creative ideas into compelling
          visual narratives. Whether it&apos;s a short film, a brand identity,
          or a social campaign, I bring attention to detail and a passion for
          the craft.
        </p>
        <p>
          When I&apos;m not editing or designing, you&apos;ll find me
          thrifting, at the beach, or playing pickleball.
        </p>
      </div>
      <div className="mt-8 h-px w-24 bg-primary/50 animate-fade-in animate-delay-400" />

      <div className="mt-10 flex flex-wrap gap-3 animate-fade-up animate-delay-500">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={socialButtonClass}
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
