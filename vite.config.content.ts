import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist/content",
    lib: {
      entry: resolve(__dirname, "src/content/index.ts"),
      name: "content",
      formats: ["iife"], // 👈 IIFE خروجی
      fileName: () => "index.js",
    },
  },
});
