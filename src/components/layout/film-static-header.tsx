import { NavLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";

export function FilmStaticHeader() {
  return (
    <header className="relative z-[60] h-16 shrink-0 overflow-hidden bg-background">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/topbar.mp4" type="video/mp4" />
      </video>

      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] bg-[linear-gradient(to_right,black_0%,transparent_50%,black_100%)]"
      />

      <div className="relative z-[3] flex items-center justify-end h-full px-6 md:px-10 [&_a]:[filter:drop-shadow(0_4px_6px_rgba(0,0,0,1))_drop-shadow(0_8px_20px_rgba(0,0,0,0.95))]">
        <div className="hidden md:flex">
          <NavLinks />
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
