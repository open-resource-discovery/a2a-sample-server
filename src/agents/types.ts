import type { Skill, AgentCapabilities, SecurityScheme } from "../types/a2a.js";

export type A2aProtocolVersion = "0.3.0" | "1.0.0";

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  protocolVersion?: A2aProtocolVersion;
  skills: Skill[];
  systemPrompt: string;
  capabilities?: AgentCapabilities;
  provider?: {
    organization: string;
    url: string;
  };
  defaultOutputModes?: string[];
  securitySchemes?: Record<string, SecurityScheme>;
  security?: Record<string, string[]>[];
}
