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
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background/index.js";
          if (chunk.name === "content") return "content/index.js";
          return "assets/[name]-[hash].js";
        },
        assetFileNames: (assetInfo) => {
          // برای HTML
          if (assetInfo.name === "index.html") {
            return "popup/index.html"; // بجای src/popup/index.html → popup/index.html
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
