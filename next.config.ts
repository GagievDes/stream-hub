import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle a self-contained Node server for the portable desktop EXE
  output: "standalone",
  // Allow both localhost and 127.0.0.1 during `next dev`
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
