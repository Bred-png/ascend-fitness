import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.reborn",
  appName: "Reborn",
  webDir: "dist/client",
  ios: {
    contentInset: "always",
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3B6FE0",
    },
  },
};

export default config;
