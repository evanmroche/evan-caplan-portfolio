import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "vumbnail.com" },
    ],
  },
};

export default nextConfig;
