import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sunny.sunnysites",
  appName: "SunnySites",
  webDir: "dist",
  server: {
    cleartext: true,
  },
  android: { adjustMarginsForEdgeToEdge: "auto" },
};

export default config;
