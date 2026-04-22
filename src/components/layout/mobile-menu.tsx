"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { links } from "./nav-links";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Scroll lock + Escape key
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const button = buttonRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [isOpen]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="md:hidden relative z-[60] p-2 text-foreground"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <nav className="flex flex-col items-center gap-6">
              {links.map((link, i) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "font-display text-4xl tracking-wide uppercase transition-colors animate-fade-up",
                      isActive
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                    style={{ animationDelay: `${(i + 1) * 100}ms` }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
