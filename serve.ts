import { file } from "bun";
import { join, normalize } from "node:path";

const portNumber = 3000;
const sourceDir = "dist";

const server = Bun.serve({
  port: portNumber,
  async fetch(req) {
    const url = new URL(req.url);

    // Strip leading slash and normalize to prevent path traversal.
    const relativePath = normalize(decodeURIComponent(url.pathname)).replace(
      /^(\.\.(\/|\\|$))+/,
      "",
    );
    let candidate = join(sourceDir, relativePath);

    let f = file(candidate);
    if (!(await f.exists()) || url.pathname.endsWith("/")) {
      // Fall back to index.html (SPA history fallback).
      candidate = join(sourceDir, "index.html");
      f = file(candidate);
    }

    if (await f.exists()) {
      return new Response(f);
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Bun web server started: ${server.url}`);
console.log(`Serving content from /${sourceDir}/`);
