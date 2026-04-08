import { Router } from "express";
import { agentRegistry } from "../agents/index.js";
import { config } from "../config.js";

export const agentCardRouter = Router();

// Backward compatible: serves the first registered agent's card (solar) at /.well-known/agent.json
agentCardRouter.get("/agent.json", (_req, res) => {
  const solarAgent = agentRegistry.get("solar");
  if (!solarAgent) {
    return res.status(404).json({ error: "Default agent not found" });
  }
  res.json(solarAgent.getAgentCard(config.serverUrl));
});

agentCardRouter.get("/agent-card.json", (_req, res) => {
  const solarAgent = agentRegistry.get("solar");
  if (!solarAgent) {
    return res.status(404).json({ error: "Default agent not found" });
  }
  res.json(solarAgent.getAgentCard(config.serverUrl));
});
