import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        background: resolve(__dirname, "src/background/index.ts"),
        content: resolve(__dirname, "src/content/index.ts"),
      },
      output: [
        // خروجی popup (ESM معمولی برای React)
        {
          dir: "dist",
          format: "es",
          entryFileNames: (chunk) => {
            if (chunk.name === "popup") return "popup/[name].js";
            return "assets/[name]-[hash].js";
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === "index.html") {
              return "popup/index.html";
            }
            return "assets/[name]-[hash][extname]";
          },
        },
        // خروجی background و content (IIFE)
        {
          dir: "dist",
          format: "iife",
          entryFileNames: (chunk) => {
            if (chunk.name === "background") return "background/index.js";
            if (chunk.name === "content") return "content/index.js";
            return "assets/[name]-[hash].js";
          },
        },
      ],
    },
  },
});
