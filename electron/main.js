const { app, BrowserWindow, session } = require("electron");
const path = require("path");
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
  // Never block the app itself or main embed hosts
  if (
    lower.includes("127.0.0.1") ||
    lower.includes("localhost") ||
    lower.includes("vidsrc.") ||
    lower.includes("2embed.") ||
    lower.includes("themoviedb.org") ||
    lower.includes("image.tmdb.org") ||
    lower.includes("cloudorchestranova.com")
  ) {
    // Still block ad paths on otherwise-allowed hosts when obvious
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

function waitForServer(url, attempts = 80) {
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
        else setTimeout(ping, 500);
      });
    };
    ping();
  });
}

function startNextServer() {
  const isWin = process.platform === "win32";
  const npmCmd = isWin ? "npm.cmd" : "npm";
  nextProcess = spawn(npmCmd, ["run", "start"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: { ...process.env },
    shell: isWin,
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#0b0c0e",
    title: "Lumina",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.once("ready-to-show", () => win.show());

  // Block popup / redirect ads entirely (do not open them externally)
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
      spawn("taskkill", ["/pid", String(nextProcess.pid), "/f", "/t"]);
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
