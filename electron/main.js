const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");

const PORT = 3847;
const APP_URL = `http://127.0.0.1:${PORT}`;
let nextProcess = null;

/** Common ad / tracker hosts seen inside embed players */
const BLOCKED_HOST_SNIPPETS = [
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "googletagmanager.com",
  "googletagservices.com",
  "adservice.google",
  "pagead2.googlesyndication",
  "adsystem",
  "amazon-adsystem.com",
  "adnxs.com",
  "adsrvr.org",
  "adform.net",
  "advertising.com",
  "popads",
  "popcash",
  "propellerads",
  "exoclick",
  "tsyndicate",
  "juicyads",
  "clickadu",
  "ad-delivery",
  "adsterra",
  "mgid.com",
  "taboola.com",
  "outbrain.com",
  "sharethis.com",
  "lijit.com",
  "pxdrop",
  "pubmatic.com",
  "openx.net",
  "rubiconproject.com",
  "casalemedia.com",
  "criteo.com",
  "moatads.com",
  "scorecardresearch.com",
  "quantserve.com",
  "hotjar.com",
  "facebook.net",
  "facebook.com/tr",
  "ads.",
  "/ads/",
  "popunder",
  "track.",
  "tracker.",
  "analytics.",
];

function isBlockedUrl(url) {
  const lower = url.toLowerCase();
  if (
    lower.includes("127.0.0.1") ||
    lower.includes("localhost") ||
    lower.includes("vidsrc.") ||
    lower.includes("2embed.") ||
    lower.includes("themoviedb.org") ||
    lower.includes("image.tmdb.org") ||
    lower.includes("cloudorchestranova.com")
  ) {
    if (lower.includes("doubleclick") || lower.includes("googlesyndication")) {
      return true;
    }
    return false;
  }
  return BLOCKED_HOST_SNIPPETS.some((snippet) => lower.includes(snippet));
}

function installAdBlock() {
  const ses = session.defaultSession;
  ses.webRequest.onBeforeRequest({ urls: ["*://*/*"] }, (details, callback) => {
    if (isBlockedUrl(details.url)) {
      callback({ cancel: true });
      return;
    }
    callback({});
  });
}

function readEnvFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, "utf8");
    const out = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function resolveTmdbKey() {
  if (process.env.TMDB_API_KEY?.trim()) return process.env.TMDB_API_KEY.trim();

  const candidates = [];
  if (app.isPackaged) {
    candidates.push(path.join(process.resourcesPath, "app", ".env.local"));
    candidates.push(path.join(path.dirname(process.execPath), ".env.local"));
  } else {
    candidates.push(path.join(__dirname, "..", ".env.local"));
  }

  for (const file of candidates) {
    const key = readEnvFile(file).TMDB_API_KEY?.trim();
    if (key) return key;
  }

  // Local-only fallback (same key used in start-app.bat)
  return "e568d7c77dd8fe416b1bb51b6f682466";
}

function waitForServer(url, attempts = 100) {
  return new Promise((resolve, reject) => {
    let left = attempts;
    const ping = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        left -= 1;
        if (left <= 0) reject(new Error("App server did not start in time"));
        else setTimeout(ping, 400);
      });
    };
    ping();
  });
}

function startNextServer() {
  const tmdbKey = resolveTmdbKey();

  if (app.isPackaged) {
    // Run the Next standalone server using Electron as Node
    const serverDir = path.join(process.resourcesPath, "app");
    const serverJs = path.join(serverDir, "server.js");
    nextProcess = spawn(process.execPath, [serverJs], {
      cwd: serverDir,
      stdio: "inherit",
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        PORT: String(PORT),
        HOSTNAME: "127.0.0.1",
        TMDB_API_KEY: tmdbKey,
      },
      windowsHide: true,
    });
    return;
  }

  const isWin = process.platform === "win32";
  const npmCmd = isWin ? "npm.cmd" : "npm";
  nextProcess = spawn(npmCmd, ["run", "start"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: { ...process.env, TMDB_API_KEY: tmdbKey },
    shell: isWin,
  });
}

function resolveAppIcon() {
  const candidates = [
    path.join(__dirname, "..", "public", "icon.ico"),
    path.join(__dirname, "..", "public", "icon-512.png"),
    path.join(process.resourcesPath || "", "app", "public", "icon-512.png"),
  ];
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

async function createWindow() {
  const icon = resolveAppIcon();
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#070708",
    title: "Strain Stream",
    autoHideMenuBar: true,
    show: false,
    ...(icon ? { icon } : {}),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  await win.loadURL(APP_URL);
}

app.whenReady().then(async () => {
  installAdBlock();
  startNextServer();
  await waitForServer(APP_URL);
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

function cleanup() {
  if (nextProcess && !nextProcess.killed) {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(nextProcess.pid), "/f", "/t"], {
        windowsHide: true,
      });
    } else {
      nextProcess.kill();
    }
  }
}

app.on("window-all-closed", () => {
  cleanup();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", cleanup);
