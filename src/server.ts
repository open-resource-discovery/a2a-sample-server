import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { agentCardRouter } from "./routes/agentCard.js";
import { jsonRpcRouter } from "./routes/jsonRpc.js";
import { agentRouter } from "./routes/agentRouter.js";
import { oauthRouter } from "./oauth/mockOAuthServer.js";

const currentFilename = fileURLToPath(import.meta.url);
const currentDirname = path.dirname(currentFilename);

export function createServer(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS headers for A2A clients
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, A2A-Version, A2A-Extensions, Authorization, X-API-Key, api_key",
    );
    if (_req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Serve static files from public/ directory
  app.use(express.static(path.join(currentDirname, "..", "public")));

  // OAuth token endpoint
  app.use("/oauth", oauthRouter);

  // Multi-agent routes at /agents
  app.use("/agents", agentRouter);

  // Backward compatible: Agent Card endpoint at /.well-known/agent.json (Solar agent)
  app.use("/.well-known", agentCardRouter);

  // Backward compatible: JSON-RPC endpoint at root (Solar agent)
  app.use("/", jsonRpcRouter);

  return app;
}
