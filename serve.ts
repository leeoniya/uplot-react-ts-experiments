import index from "./index.html";

const isDev = process.env.NODE_ENV !== "production";
const portNumber = Number(process.env.BUN_PORT ?? (isDev ? 8080 : 3000));

const server = Bun.serve({
  port: portNumber,
  // Bundle and serve the HTML entrypoint (and its assets) directly.
  // The wildcard route doubles as the SPA history fallback.
  // HMR is enabled in dev; disabled (with minification) in production.
  development: isDev && { hmr: true },
  routes: {
    "/*": index,
  },
});

console.log(`Bun web server started (${isDev ? "dev" : "prod"}): ${server.url}`);
