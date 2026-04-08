import { agentRegistry } from "./registry.js";
import { getLlmClient } from "../services/llmService.js";

// Import all agent implementations
import { SolarAgent } from "./implementations/solarAgent.js";
import { CodeReviewerAgent } from "./implementations/codeReviewerAgent.js";
import { ChefAgent } from "./implementations/chefAgent.js";
import { DadJokesAgent } from "./implementations/dadJokesAgent.js";
import { LanguageTutorAgent } from "./implementations/languageTutorAgent.js";
import { FitnessAgent } from "./implementations/fitnessAgent.js";
import { TriviaAgent } from "./implementations/triviaAgent.js";
import { StorytellerAgent } from "./implementations/storytellerAgent.js";
import { TechNewsAgent } from "./implementations/techNewsAgent.js";
import { HaikuAgent } from "./implementations/haikuAgent.js";
import { ConverterAgent } from "./implementations/converterAgent.js";
import { MediaAgent } from "./implementations/mediaAgent.js";

export function registerAllAgents(): void {
  const llmClient = getLlmClient();

  // Register all agents
  agentRegistry.register(new SolarAgent(llmClient));
  agentRegistry.register(new CodeReviewerAgent(llmClient));
  agentRegistry.register(new ChefAgent(llmClient));
  agentRegistry.register(new DadJokesAgent(llmClient));
  agentRegistry.register(new LanguageTutorAgent(llmClient));
  agentRegistry.register(new FitnessAgent(llmClient));
  agentRegistry.register(new TriviaAgent(llmClient));
  agentRegistry.register(new StorytellerAgent(llmClient));
  agentRegistry.register(new TechNewsAgent(llmClient));
  agentRegistry.register(new HaikuAgent(llmClient));
  agentRegistry.register(new ConverterAgent(llmClient));
  agentRegistry.register(new MediaAgent(llmClient));

  // eslint-disable-next-line no-console
  console.log(
    `Registered ${agentRegistry.getAllIds().length} agents: ${agentRegistry.getAllIds().join(", ")}`,
  );
}

export { agentRegistry } from "./registry.js";
export { BaseAgent } from "./baseAgent.js";
export type { AgentDefinition } from "./types.js";
