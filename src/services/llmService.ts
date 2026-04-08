import { LlmClient } from "../llm-client/index.js";

let sharedLlmClient: LlmClient | null = null;

export function initializeLlmClient(): LlmClient {
  if (!sharedLlmClient) {
    sharedLlmClient = new LlmClient({ model: "mock" });
  }
  return sharedLlmClient;
}

export function getLlmClient(): LlmClient {
  if (!sharedLlmClient) {
    throw new Error("LLM client not initialized. Call initializeLlmClient() first.");
  }
  return sharedLlmClient;
}
