import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sunny.sunnysites",
  appName: "Sunny Sites",
  webDir: "dist",
  server: {
    cleartext: true,
  },
};

export default config;
