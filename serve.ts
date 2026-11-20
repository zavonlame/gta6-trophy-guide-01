// Leonida Platinum — tiny static file server for local testing.
// Own code, written for this entry. Serves app/ at http://localhost:8080.
// Usage: node serve.ts  (then open http://localhost:8080 in desktop Chrome)

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP_DIR = resolve(join(fileURLToPath(new URL(".", import.meta.url)), "app"));
const PORT = Number(process.env.PORT || 8080);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = createServer((req, res) => {
  const path = normalize("/" + (req.url || "/").split("?")[0]);
  const file = join(APP_DIR, path === "/" ? "index.html" : path);
  if (!file.startsWith(APP_DIR) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found\n");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`serving app/ at http://localhost:${PORT}`);
  console.log(`app dir: ${APP_DIR}`);
});
