import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // все запросы, начинающиеся с /api, будут перенаправлены на бэкенд
      "/api": {
        target: "http://localhost:3001", // адрес API-сервера
        changeOrigin: true,
      },
    },
  },
});
