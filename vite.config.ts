import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function localCrudPlugin() {
  return {
    name: "local-crud",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith("/api/")) {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            if (body) {
              try { req.body = JSON.parse(body); } catch (e) { }
            }
            next();
          });
        } else {
          next();
        }
      });

      server.middlewares.use("/api/regions", (req: any, res: any) => {
        const filePath = path.resolve(__dirname, "./src/data/regions.json");
        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json");
          res.end(fs.readFileSync(filePath, "utf-8"));
        } else if (req.method === "POST" || req.method === "PUT") {
          fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true }));
        } else {
          res.statusCode = 405;
          res.end();
        }
      });

      server.middlewares.use("/api/pois", (req: any, res: any) => {
        const filePath = path.resolve(__dirname, "./src/data/pois.json");
        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json");
          res.end(fs.readFileSync(filePath, "utf-8"));
        } else if (req.method === "POST" || req.method === "PUT") {
          fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true }));
        } else {
          res.statusCode = 405;
          res.end();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.GITHUB_ACTIONS ? undefined : "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), localCrudPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
