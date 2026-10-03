import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.strainstream.app",
  appName: "Strain Stream",
  webDir: "out",
  android: {
    allowMixedContent: true,
    backgroundColor: "#070708",
    webContentsDebuggingEnabled: true,
  },
  server: {
    androidScheme: "https",
    hostname: "localhost",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#070708",
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: "#070708",
      style: "DARK",
    },
  },
};

export default config;
