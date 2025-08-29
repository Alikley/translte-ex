import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist/background",
    lib: {
      entry: resolve(__dirname, "src/background/index.ts"),
      name: "background",
      formats: ["iife"], // 👈 IIFE خروجی
      fileName: () => "index.js",
    },
  },
});
