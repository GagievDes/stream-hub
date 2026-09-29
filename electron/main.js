const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

const PORT = 3847;
const APP_URL = `http://127.0.0.1:${PORT}`;
let nextProcess = null;

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

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  await win.loadURL(APP_URL);
}

app.whenReady().then(async () => {
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
