import { Hero } from "@/components/sections/hero";
import { ShowcaseGrid } from "@/components/sections/showcase-grid";
import { SplitSection } from "@/components/sections/split-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ShowcaseGrid />
      <SplitSection />
    </>
  );
}
