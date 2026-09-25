"use client";

import { useEffect } from "react";

// Only where the hero fits on screen. On phones (stacked layout) and short
// landscape screens it is taller than the viewport, and locking would hide
// the bottom nav rows.
const LOCK_QUERY = "(min-width: 768px) and (min-height: 600px)";

export function LockScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const mq = window.matchMedia(LOCK_QUERY);

    const apply = () => {
      html.style.overflow = mq.matches ? "hidden" : prevHtml;
      body.style.overflow = mq.matches ? "hidden" : prevBody;
    };
    apply();
    mq.addEventListener("change", apply);

    return () => {
      mq.removeEventListener("change", apply);
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  return null;
}
