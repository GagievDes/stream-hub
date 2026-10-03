import {
  copyFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const isWin = process.platform === "win32";

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
    shell: isWin,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const tmdbKey =
  process.env.NEXT_PUBLIC_TMDB_API_KEY?.trim() ||
  process.env.TMDB_API_KEY?.trim() ||
  "e568d7c77dd8fe416b1bb51b6f682466";

const apiDir = join(root, "src", "app", "api");
const apiBackup = join(root, "src", "app", "_api_android_backup");
const movedApi = existsSync(apiDir);

if (movedApi) {
  renameSync(apiDir, apiBackup);
}

try {
  run(isWin ? "npx.cmd" : "npx", ["next", "build"], {
    STRAIN_STATIC: "1",
    NEXT_PUBLIC_STATIC: "1",
    NEXT_PUBLIC_TMDB_API_KEY: tmdbKey,
  });
} finally {
  if (movedApi && existsSync(apiBackup) && !existsSync(apiDir)) {
    renameSync(apiBackup, apiDir);
  }
}

run(isWin ? "npx.cmd" : "npx", ["cap", "sync", "android"]);

const androidDir = join(root, "android");
const gradle = isWin ? "gradlew.bat" : "./gradlew";
if (!existsSync(join(androidDir, isWin ? "gradlew.bat" : "gradlew"))) {
  console.error("Android project missing. Run: npx cap add android");
  process.exit(1);
}

const sdkDir =
  process.env.ANDROID_SDK_ROOT ||
  process.env.ANDROID_HOME ||
  (isWin
    ? join(process.env.LOCALAPPDATA || "", "Android", "Sdk")
    : join(process.env.HOME || "", "Android", "Sdk"));

if (sdkDir && existsSync(sdkDir)) {
  const escaped = sdkDir.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
  writeFileSync(join(androidDir, "local.properties"), `sdk.dir=${escaped}\n`);
}

const gradleResult = spawnSync(gradle, ["assembleDebug"], {
  cwd: androidDir,
  stdio: "inherit",
  env: {
    ...process.env,
    ANDROID_HOME: sdkDir,
    ANDROID_SDK_ROOT: sdkDir,
  },
  shell: isWin,
});
if (gradleResult.status !== 0) {
  process.exit(gradleResult.status ?? 1);
}

const apkSrc = join(
  androidDir,
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk",
);
const distDir = join(root, "dist");
mkdirSync(distDir, { recursive: true });
if (!existsSync(apkSrc)) {
  console.error("Gradle finished but APK was not found at", apkSrc);
  process.exit(1);
}

const dest = join(distDir, "Strain-Stream.apk");
copyFileSync(apkSrc, dest);
console.log("\nAPK ready:");
console.log("  dist/Strain-Stream.apk");
console.log("Copy it to a phone, enable Install unknown apps, and open the file.");
