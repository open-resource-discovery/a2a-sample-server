import type { AgentDefinition, A2aProtocolVersion } from "./types.js";
import type { AgentCard, Part } from "../types/a2a.js";
import type { LlmClient } from "../llm-client/index.js";
import { config } from "../config.js";
import { formatAgentCard } from "../utils/protocolFormatter.js";

export abstract class BaseAgent {
  protected llmClient: LlmClient;

  public constructor(llmClient: LlmClient) {
    this.llmClient = llmClient;
  }

  public abstract getDefinition(): AgentDefinition;

  public getProtocolVersion(): A2aProtocolVersion {
    return this.getDefinition().protocolVersion ?? "0.3.0";
  }

  public async handleMessage(userText: string): Promise<string> {
    const definition = this.getDefinition();
    const response = await this.llmClient.chat([
      { role: "system", content: definition.systemPrompt },
      { role: "user", content: userText },
    ]);
    return response.choices[0].message.content;
  }

  public async handleMessageWithParts(userText: string): Promise<Part[]> {
    const response = await this.handleMessage(userText);
    return [{ text: response }];
  }

  public supportsStreaming(): boolean {
    return this.getDefinition().capabilities?.streaming === true;
  }

  public async *handleMessageStream(userText: string): AsyncGenerator<string> {
    const definition = this.getDefinition();
    const stream = this.llmClient.chatStream([
      { role: "system", content: definition.systemPrompt },
      { role: "user", content: userText },
    ]);
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }

  public getAgentCard(baseUrl?: string): Record<string, unknown> {
    const def = this.getDefinition();
    const url = baseUrl ?? config.serverUrl;
    const version = this.getProtocolVersion();

    const card: AgentCard = {
      name: def.name,
      description: def.description,
      version: def.version,
      supportedInterfaces: [
        {
          url,
          protocolBinding: "JSONRPC",
          protocolVersion: version,
        },
      ],
      capabilities: def.capabilities ?? {
        streaming: false,
        pushNotifications: false,
      },
      skills: def.skills,
      defaultInputModes: ["text/plain"],
      defaultOutputModes: def.defaultOutputModes ?? ["text/plain"],
      provider: def.provider ?? {
        organization: "SAP SE",
        url: "https://sap.com",
      },
    };

    if (def.securitySchemes) {
      card.securitySchemes = def.securitySchemes;
    }
    if (def.security) {
      card.security = def.security;
    }

    return formatAgentCard(card, version);
  }

  public getId(): string {
    return this.getDefinition().id;
  }
}
