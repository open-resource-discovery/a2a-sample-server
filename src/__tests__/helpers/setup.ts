import { initializeLlmClient } from "../../services/llmService.js";
import { registerAllAgents } from "../../agents/index.js";
import { createServer } from "../../server.js";

/**
 * Initializes the LLM client, registers all agents, and returns the Express app.
 */
export function createTestApp(): ReturnType<typeof createServer> {
  initializeLlmClient();
  registerAllAgents();
  return createServer();
}

/**
 * Initializes the LLM client and registers all agents (no server).
 */
export function setupAgents(): void {
  initializeLlmClient();
  registerAllAgents();
}
