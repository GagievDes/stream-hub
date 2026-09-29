const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

const PORT = 3847;
const APP_URL = `http://127.0.0.1:${PORT}`;
let nextProcess = null;

function waitForServer(url, attempts = 60) {
  return new Promise((resolve, reject) => {
    let left = attempts;
    const ping = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        left -= 1;
        if (left <= 0) reject(new Error("App server did not start"));
        else setTimeout(ping, 500);
      });
    };
    ping();
  });
}

function startNextServer() {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  nextProcess = spawn(npmCmd, ["run", "start"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: { ...process.env },
    shell: process.platform === "win32",
  });
  nextProcess.on("exit", (code) => {
    if (code && code !== 0) {
      console.error("Next.js server exited with code", code);
    }
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0b0c0e",
    title: "Lumina",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

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

app.on("window-all-closed", () => {
  if (nextProcess && !nextProcess.killed) {
    nextProcess.kill();
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (nextProcess && !nextProcess.killed) {
    nextProcess.kill();
  }
});
