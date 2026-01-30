import { defineConfig } from "vite";

export default defineConfig({
    base: "/99942-apophis/",
    build: {
        outDir: "dist",
        sourcemap: true,
    },
    server: {
        port: 3000,
    },
});
