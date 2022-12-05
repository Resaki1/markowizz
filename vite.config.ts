import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
      ],
      manifest: {
        name: "markowizz",
        short_name: "markowizz",
        description:
          "Your personal portfolio manager creating optimal portfolios based on the Markowitz model.",
        theme_color: "#ffffff",
        icons: [
          /* {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          }, */
        ],
      },
      /* enable sw on development */
      devOptions: {
        enabled: true,
        /* other options */
      },
    }),
  ],
  build: {
    target: "esnext",
  },
});
