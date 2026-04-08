/**
 * Tests for src/agents/registry.ts
 *
 * The agentRegistry is a module-level singleton, so each test uses
 * jest.resetModules() + dynamic import() to obtain a fresh instance.
 */

import { jest } from "@jest/globals";
import type { AgentDefinition } from "../types.js";
import { BaseAgent } from "../baseAgent.js";
import { LlmClient } from "../../llm-client/index.js";

// ---------------------------------------------------------------------------
// Concrete test subclass of the abstract BaseAgent
// ---------------------------------------------------------------------------

class TestAgent extends BaseAgent {
  private readonly agentId: string;
  private readonly agentName: string;

  public constructor(id: string, name?: string) {
    super(new LlmClient({ model: "mock" }));
    this.agentId = id;
    this.agentName = name ?? "Test Agent";
  }

  public getDefinition(): AgentDefinition {
    return {
      id: this.agentId,
      name: this.agentName,
      description: "A test agent",
      version: "1.0.0",
      skills: [],
      systemPrompt: "You are a test agent.",
    };
  }
}

// ---------------------------------------------------------------------------
// Helper to get a fresh registry from a fresh module load
// ---------------------------------------------------------------------------

async function freshRegistry(): Promise<(typeof import("../registry.js"))["agentRegistry"]> {
  const mod = await import("../registry.js");
  return mod.agentRegistry;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.resetModules();
});

describe("AgentRegistry", () => {
  describe("register", () => {
    it("stores an agent that can be retrieved by id", async () => {
      const registry = await freshRegistry();
      const agent = new TestAgent("agent-1");
      registry.register(agent);
      expect(registry.get("agent-1")).toBe(agent);
    });

    it("overwrites an existing agent with the same id", async () => {
      const registry = await freshRegistry();
      const agent1 = new TestAgent("agent-1", "First");
      const agent2 = new TestAgent("agent-1", "Second");
      registry.register(agent1);
      registry.register(agent2);
      expect(registry.get("agent-1")).toBe(agent2);
      expect(registry.getAll()).toHaveLength(1);
    });

    it("can register multiple agents with different ids", async () => {
      const registry = await freshRegistry();
      registry.register(new TestAgent("a"));
      registry.register(new TestAgent("b"));
      registry.register(new TestAgent("c"));
      expect(registry.getAll()).toHaveLength(3);
    });
  });

  describe("get", () => {
    it("returns the agent for a known id", async () => {
      const registry = await freshRegistry();
      const agent = new TestAgent("x");
      registry.register(agent);
      expect(registry.get("x")).toBe(agent);
    });

    it("returns undefined for an unknown id", async () => {
      const registry = await freshRegistry();
      expect(registry.get("nonexistent")).toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("returns an empty array when no agents are registered", async () => {
      const registry = await freshRegistry();
      expect(registry.getAll()).toEqual([]);
    });

    it("returns all registered agents", async () => {
      const registry = await freshRegistry();
      const a1 = new TestAgent("a1");
      const a2 = new TestAgent("a2");
      registry.register(a1);
      registry.register(a2);
      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(a1);
      expect(all).toContain(a2);
    });
  });

  describe("getAllIds", () => {
    it("returns an empty array when no agents are registered", async () => {
      const registry = await freshRegistry();
      expect(registry.getAllIds()).toEqual([]);
    });

    it("returns all registered agent ids", async () => {
      const registry = await freshRegistry();
      registry.register(new TestAgent("alpha"));
      registry.register(new TestAgent("beta"));
      const ids = registry.getAllIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain("alpha");
      expect(ids).toContain("beta");
    });
  });

  describe("has", () => {
    it("returns true for a registered agent", async () => {
      const registry = await freshRegistry();
      registry.register(new TestAgent("present"));
      expect(registry.has("present")).toBe(true);
    });

    it("returns false for an unregistered agent", async () => {
      const registry = await freshRegistry();
      expect(registry.has("absent")).toBe(false);
    });

    it("returns false after reset (fresh module)", async () => {
      // Register in one module load
      const reg1 = await freshRegistry();
      reg1.register(new TestAgent("temp"));
      expect(reg1.has("temp")).toBe(true);

      // Fresh module load should have empty registry
      jest.resetModules();
      const reg2 = await freshRegistry();
      expect(reg2.has("temp")).toBe(false);
    });
  });

  describe("singleton isolation", () => {
    it("each jest.resetModules() yields an independent registry", async () => {
      const reg1 = await freshRegistry();
      reg1.register(new TestAgent("only-in-reg1"));

      jest.resetModules();
      const reg2 = await freshRegistry();
      expect(reg2.has("only-in-reg1")).toBe(false);
      expect(reg2.getAll()).toHaveLength(0);
    });
  });
});
