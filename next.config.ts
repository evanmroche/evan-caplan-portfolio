import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_678_400,
    remotePatterns: [
      { protocol: "https", hostname: "vumbnail.com" },
    ],
  },
};

export default nextConfig;
