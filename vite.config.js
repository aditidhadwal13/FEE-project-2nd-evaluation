import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import apiApp from "./server/server.js";

function medicareBackendPlugin() {
  return {
    name: "medicare-sqlite-backend",
    configureServer(server) {
      server.middlewares.use(apiApp);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiApp);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), medicareBackendPlugin()]
});
