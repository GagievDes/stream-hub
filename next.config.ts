import type { NextConfig } from "next";

const isStatic = process.env.STRAIN_STATIC === "1";

/** Project Pages path, e.g. `/stream-hub`. Empty when the site is served at the domain root. */
function pagesBasePath(): string {
  const raw = (process.env.BASE_PATH ?? "").trim();
  if (!raw || raw === "/") return "";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, "");
}

const basePath = pagesBasePath();

const nextConfig: NextConfig = {
  output: isStatic ? "export" : "standalone",
  trailingSlash: isStatic,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
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
