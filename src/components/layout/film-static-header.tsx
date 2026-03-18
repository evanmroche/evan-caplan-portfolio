"use client";

import { useEffect, useState } from "react";
import { NavLinks } from "./nav-links";

export function FilmStaticHeader() {
  const [videoExists, setVideoExists] = useState(false);

  useEffect(() => {
    fetch("/videos/film-static.mp4", { method: "HEAD" })
      .then((res) => {
        if (res.ok) setVideoExists(true);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="relative h-16 shrink-0 overflow-hidden">
      {/* Background: video or animated gradient fallback */}
      {videoExists ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/film-static.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 film-grain bg-gradient-to-r from-[oklch(0.10_0.005_260)] via-[oklch(0.15_0.01_270)] to-[oklch(0.10_0.005_260)]" />
      )}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-[2]" />

      {/* Nav overlay */}
      <div className="relative z-[3] flex items-center justify-between h-full px-6 md:px-10">
        <span className="font-display text-2xl tracking-wider text-primary">
          EC
        </span>
        <NavLinks />
      </div>
    </header>
  );
}
