import { LoopingVideo } from "@/components/ui/looping-video";

type Video = {
  slug: string;
  vimeoId: string;
  title: string;
  vertical?: boolean;
  width?: number;
  height?: number;
};

const videos: Video[] = [
  { slug: "jd-sports-1stfloorcashdesk-30", vimeoId: "1185017843", title: "JD Sports 1stFloorCashDesk :30", width: 1080, height: 720 },
  { slug: "thriftcon-nyc-60", vimeoId: "1181461866", title: "Thriftcon NYC :60" },
  { slug: "carhartt-women-hype-30", vimeoId: "1184986597", title: "Carhartt Women Hype :30", width: 1280, height: 720 },
  { slug: "thriftcon-la", vimeoId: "1181427880", title: "Thriftcon LA" },
  { slug: "thriftcon-nyc", vimeoId: "1181451985", title: "Thriftcon NYC" },
  { slug: "jd-sports-mensnikeapparel-15", vimeoId: "1184987705", title: "JD Sports MensNikeApparel :15", width: 608, height: 540 },
  { slug: "jd-sports-mensadidasfootwearsis-15", vimeoId: "1184987654", title: "JD Sports MensAdidasFootwearSIS :15", width: 640, height: 360 },
  { slug: "carhartt-womens-denim-social-15", vimeoId: "1184986720", title: "Carhartt Womens Denim Social :15", width: 720, height: 900 },
  { slug: "six99-deal", vimeoId: "1165866674", title: "$6.99 Deal Feed The Crew :30" },
  { slug: "dominos-best-deal-ever-999-generic", vimeoId: "1185019373", title: "Domino's Best Deal Ever $9.99 Generic", width: 1280, height: 720 },
  { slug: "dominos-best-deal-ever-999-15", vimeoId: "1184987778", title: "Domino's Best Deal Ever $9.99 :15", width: 1280, height: 720 },
  { slug: "jd-sports-podium-ticker", vimeoId: "1184987762", title: "JD Sports 1stFloorDigital Footwear Podium Ticker", width: 640, height: 232 },
  { slug: "jd-sports-cashdeskbulkhead-ticker", vimeoId: "1185018753", title: "JD Sports CashDeskBulkhead Ticker", width: 1366, height: 182 },
  { slug: "jd-sports-escalatorportalticker", vimeoId: "1185018076", title: "JD Sports EscalatorPortalTicker", width: 1366, height: 146 },
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
                  width={video.width}
                  height={video.height}
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
