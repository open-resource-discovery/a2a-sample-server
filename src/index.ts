import "dotenv/config";
import { createServer } from "./server.js";
import { config } from "./config.js";
import { initializeLlmClient } from "./services/llmService.js";
import { registerAllAgents, agentRegistry } from "./agents/index.js";

function main(): void {
  // eslint-disable-next-line no-console
  console.log("A2A Multi-Agent Server starting up...");

  // Initialize mock LLM client
  initializeLlmClient();
  // eslint-disable-next-line no-console
  console.log("LLM client ready!");

  // Register all agents
  registerAllAgents();

  // Start server
  const app = createServer();
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`\nServer listening on port ${config.port}`);
    // eslint-disable-next-line no-console
    console.log(`\nAvailable agents:`);
    agentRegistry.getAll().forEach((agent) => {
      const def = agent.getDefinition();
      // eslint-disable-next-line no-console
      console.log(`  - ${def.name}: ${config.serverUrl}/agents/${def.id}/`);
    });
    // eslint-disable-next-line no-console
    console.log(`\nBackward compatible (Solar):`);
    // eslint-disable-next-line no-console
    console.log(`  - Agent card: ${config.serverUrl}/agents/solar/agent.json`);
    // eslint-disable-next-line no-console
    console.log(`  - JSON-RPC: ${config.serverUrl}/`);
    // eslint-disable-next-line no-console
    console.log(`\nAll agents: ${config.serverUrl}/agents`);
  });
}

main();
