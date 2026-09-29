import { cpSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const staticSrc = join(root, ".next", "static");
const staticDest = join(standalone, ".next", "static");
const publicSrc = join(root, "public");
const publicDest = join(standalone, "public");

if (!existsSync(standalone)) {
  console.error("Missing .next/standalone — run `next build` first with output: 'standalone'.");
  process.exit(1);
}

mkdirSync(join(standalone, ".next"), { recursive: true });
cpSync(staticSrc, staticDest, { recursive: true });
if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true });
}

const envSrc = join(root, ".env.local");
const envDest = join(standalone, ".env.local");
if (existsSync(envSrc)) {
  cpSync(envSrc, envDest);
} else {
  writeFileSync(
    envDest,
    "TMDB_API_KEY=e568d7c77dd8fe416b1bb51b6f682466\n",
    "utf8",
  );
}

// Sanity: server entry must exist
const serverJs = join(standalone, "server.js");
if (!existsSync(serverJs)) {
  console.error("standalone/server.js missing after build.");
  process.exit(1);
}

console.log("Standalone app prepared at .next/standalone");
console.log("Env key present:", Boolean(readFileSync(envDest, "utf8").includes("TMDB_API_KEY=")));
