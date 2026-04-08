import type { BaseAgent } from "./baseAgent.js";

class AgentRegistry {
  private readonly agents: Map<string, BaseAgent> = new Map();

  public register(agent: BaseAgent): void {
    const id = agent.getId();
    this.agents.set(id, agent);
  }

  public get(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  public getAll(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  public getAllIds(): string[] {
    return Array.from(this.agents.keys());
  }

  public has(agentId: string): boolean {
    return this.agents.has(agentId);
  }
}

export const agentRegistry = new AgentRegistry();
