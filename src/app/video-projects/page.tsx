import { LoopingVideo } from "@/components/ui/looping-video";

type Video = {
  slug: string;
  vimeoId: string;
  title: string;
  vertical?: boolean;
};

const videos: Video[] = [
  { slug: "thriftcon-nyc-60", vimeoId: "1181461866", title: "Thriftcon NYC :60" },
  { slug: "thriftcon-nyc", vimeoId: "1181451985", title: "Thriftcon NYC" },
  { slug: "thriftcon-la", vimeoId: "1181427880", title: "Thriftcon LA" },
  { slug: "six99-deal", vimeoId: "1165866674", title: "6.99 Deal Feed The Crew :30" },
  { slug: "wildcoat-reviews", vimeoId: "1164147421", title: "WILDCOAT Reviews Social", vertical: true },
  { slug: "wildcoat-pov", vimeoId: "1164147189", title: "WILDCOAT POV Social", vertical: true },
];

export default function VideoProjectsPage() {
  return (
    <section className="py-20 md:py-28">
      <header className="px-6 md:px-10 mb-12 md:mb-16 text-center">
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wider text-foreground animate-fade-up">
          Video Projects
        </h1>
        <div className="mt-6 mx-auto h-px w-24 bg-primary/50 animate-fade-in animate-delay-400" />
      </header>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {videos.map((video, index) => (
            <figure
              key={video.slug}
              className="animate-fade-up"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <a
                href={`https://vimeo.com/${video.vimeoId}`}
                target="_blank"
                rel="noreferrer"
                className="group/link block"
                aria-label={`Watch ${video.title} on Vimeo`}
              >
                <LoopingVideo
                  src={`/videos/${video.slug}.mp4`}
                  posterSrc={`https://vumbnail.com/${video.vimeoId}_large.jpg`}
                  title={video.title}
                  vertical={video.vertical}
                  priority={index === 0}
                />
                <figcaption className="mt-3 text-center">
                  <span className="font-display text-2xl md:text-3xl tracking-wide text-foreground transition-colors group-hover/link:text-primary">
                    {video.title}
                  </span>
                </figcaption>
              </a>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
