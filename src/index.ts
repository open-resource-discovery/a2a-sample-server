import "dotenv/config";
import { agentRegistry, registerAllAgents } from "./agents/index.js";
import { config } from "./config.js";
import { createServer } from "./server.js";
import { initializeLlmClient } from "./services/llmService.js";

function main(): void {
  // biome-ignore lint/suspicious/noConsole: Existing exception retained during tooling migration.
  console.log("A2A Multi-Agent Server starting up...");

  // Initialize mock LLM client
  initializeLlmClient();
  // biome-ignore lint/suspicious/noConsole: Existing exception retained during tooling migration.
  console.log("LLM client ready!");

  // Register all agents
  registerAllAgents();

  // Start server
  const app = createServer();
  app.listen(config.port, () => {
    // biome-ignore lint/suspicious/noConsole: Existing exception retained during tooling migration.
    console.log(`\nServer listening on port ${config.port}`);
    // biome-ignore lint/suspicious/noConsole: Existing exception retained during tooling migration.
    console.log(`\nAvailable agents:`);
    agentRegistry.getAll().forEach((agent) => {
      const def = agent.getDefinition();
      // biome-ignore lint/suspicious/noConsole: Existing exception retained during tooling migration.
      console.log(`  - ${def.name}: ${config.serverUrl}/agents/${def.id}/`);
    });
    // biome-ignore lint/suspicious/noConsole: Existing exception retained during tooling migration.
    console.log(`\nBackward compatible (Solar):`);
    // biome-ignore lint/suspicious/noConsole: Existing exception retained during tooling migration.
    console.log(`  - Agent card: ${config.serverUrl}/agents/solar/agent.json`);
    // biome-ignore lint/suspicious/noConsole: Existing exception retained during tooling migration.
    console.log(`  - JSON-RPC: ${config.serverUrl}/`);
    // biome-ignore lint/suspicious/noConsole: Existing exception retained during tooling migration.
    console.log(`\nAll agents: ${config.serverUrl}/agents`);
  });
}

main();
