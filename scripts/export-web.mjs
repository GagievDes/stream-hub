import { existsSync, renameSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const isWin = process.platform === "win32";

const tmdbKey =
  process.env.NEXT_PUBLIC_TMDB_API_KEY?.trim() ||
  process.env.TMDB_API_KEY?.trim() ||
  "e568d7c77dd8fe416b1bb51b6f682466";

const apiDir = join(root, "src", "app", "api");
const apiBackup = join(root, "src", "app", "_api_pages_backup");
const movedApi = existsSync(apiDir);

if (movedApi) {
  renameSync(apiDir, apiBackup);
}

let status = 0;
try {
  const result = spawnSync(isWin ? "npx.cmd" : "npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      STRAIN_STATIC: "1",
      NEXT_PUBLIC_STATIC: "1",
      NEXT_PUBLIC_TMDB_API_KEY: tmdbKey,
    },
    shell: isWin,
  });
  status = result.status ?? 1;
} finally {
  if (movedApi && existsSync(apiBackup) && !existsSync(apiDir)) {
    renameSync(apiBackup, apiDir);
  }
}

if (status !== 0) {
  process.exit(status);
}

writeFileSync(join(root, "out", ".nojekyll"), "");
console.log("\nStatic site ready in out/");
console.log("GitHub Pages publishes this folder from the Deploy GitHub Pages workflow.");
