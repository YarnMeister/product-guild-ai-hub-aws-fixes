import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Vite plugin to regenerate content index when markdown files change
 */
function contentIndexWatcher() {
  return {
    name: "content-index-watcher",
    async handleHotUpdate({ file, server }: any) {
      if (file.includes("public/content") && file.endsWith(".md")) {
        console.log("📝 Markdown file changed, regenerating content index...");
        try {
          await execAsync("npm run generate-content-index");
          console.log("✅ Content index regenerated");
          // Trigger a full reload
          server.ws.send({
            type: "full-reload",
            path: "*",
          });
        } catch (error) {
          console.error("❌ Failed to regenerate content index:", error);
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && contentIndexWatcher(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
