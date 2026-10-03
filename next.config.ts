import type { NextConfig } from "next";

const isStatic = process.env.STRAIN_STATIC === "1";

const nextConfig: NextConfig = {
  output: isStatic ? "export" : "standalone",
  trailingSlash: isStatic,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: isStatic,
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
