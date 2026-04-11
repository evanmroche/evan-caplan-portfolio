import type { Metadata } from "next";
import { bebasNeue, outfit } from "./fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { FilmStaticHeader } from "@/components/layout/film-static-header";
import { SmpteBars } from "@/components/layout/smpte-bars";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evan Caplan — Video Editor & Graphic Designer",
  description:
    "Portfolio of Evan Caplan — video editor and graphic designer with 4+ years of experience in cinematic storytelling and visual design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${outfit.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <FilmStaticHeader />
          <SmpteBars />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
