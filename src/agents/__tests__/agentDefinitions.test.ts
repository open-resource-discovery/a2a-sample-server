import { LlmClient } from "../../llm-client/client.js";
import { SolarAgent } from "../implementations/solarAgent.js";
import { CodeReviewerAgent } from "../implementations/codeReviewerAgent.js";
import { ChefAgent } from "../implementations/chefAgent.js";
import { DadJokesAgent } from "../implementations/dadJokesAgent.js";
import { LanguageTutorAgent } from "../implementations/languageTutorAgent.js";
import { FitnessAgent } from "../implementations/fitnessAgent.js";
import { TriviaAgent } from "../implementations/triviaAgent.js";
import { StorytellerAgent } from "../implementations/storytellerAgent.js";
import { TechNewsAgent } from "../implementations/techNewsAgent.js";
import { HaikuAgent } from "../implementations/haikuAgent.js";
import { ConverterAgent } from "../implementations/converterAgent.js";
import { MediaAgent } from "../implementations/mediaAgent.js";
import type { BaseAgent } from "../baseAgent.js";

const llmClient = new LlmClient({ model: "mock" });

const agents: { name: string; id: string; agent: BaseAgent }[] = [
  { name: "SolarAgent", id: "solar", agent: new SolarAgent(llmClient) },
  { name: "CodeReviewerAgent", id: "code-reviewer", agent: new CodeReviewerAgent(llmClient) },
  { name: "ChefAgent", id: "chef", agent: new ChefAgent(llmClient) },
  { name: "DadJokesAgent", id: "dad-jokes", agent: new DadJokesAgent(llmClient) },
  { name: "LanguageTutorAgent", id: "language-tutor", agent: new LanguageTutorAgent(llmClient) },
  { name: "FitnessAgent", id: "fitness", agent: new FitnessAgent(llmClient) },
  { name: "TriviaAgent", id: "trivia", agent: new TriviaAgent(llmClient) },
  { name: "StorytellerAgent", id: "storyteller", agent: new StorytellerAgent(llmClient) },
  { name: "TechNewsAgent", id: "tech-news", agent: new TechNewsAgent(llmClient) },
  { name: "HaikuAgent", id: "haiku", agent: new HaikuAgent(llmClient) },
  { name: "ConverterAgent", id: "converter", agent: new ConverterAgent(llmClient) },
  { name: "MediaAgent", id: "media", agent: new MediaAgent(llmClient) },
];

describe("Agent Definitions", () => {
  it("should have exactly 12 agents", () => {
    expect(agents).toHaveLength(12);
  });

  describe.each(agents)("$name (id: $id)", ({ id, agent }) => {
    const definition = agent.getDefinition();

    it("should have the expected id", () => {
      expect(definition.id).toBe(id);
    });

    it("should have a non-empty id", () => {
      expect(typeof definition.id).toBe("string");
      expect(definition.id.length).toBeGreaterThan(0);
    });

    it("should have a non-empty name", () => {
      expect(typeof definition.name).toBe("string");
      expect(definition.name.length).toBeGreaterThan(0);
    });

    it("should have a non-empty description", () => {
      expect(typeof definition.description).toBe("string");
      expect(definition.description.length).toBeGreaterThan(0);
    });

    it("should have a version matching semver-like pattern", () => {
      expect(definition.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should have a non-empty skills array", () => {
      expect(Array.isArray(definition.skills)).toBe(true);
      expect(definition.skills.length).toBeGreaterThan(0);
    });

    it("should have skills with id, name, description, and tags", () => {
      for (const skill of definition.skills) {
        expect(typeof skill.id).toBe("string");
        expect(skill.id.length).toBeGreaterThan(0);

        expect(typeof skill.name).toBe("string");
        expect(skill.name.length).toBeGreaterThan(0);

        expect(typeof skill.description).toBe("string");
        expect(skill.description.length).toBeGreaterThan(0);

        expect(Array.isArray(skill.tags)).toBe(true);
        expect(skill.tags.length).toBeGreaterThan(0);
      }
    });

    it("should have a non-empty systemPrompt", () => {
      expect(typeof definition.systemPrompt).toBe("string");
      expect(definition.systemPrompt.length).toBeGreaterThan(0);
    });

    it("should have valid securitySchemes if present", () => {
      if (definition.securitySchemes) {
        for (const [, scheme] of Object.entries(definition.securitySchemes)) {
          expect(scheme).toHaveProperty("type");
          expect(typeof scheme.type).toBe("string");
          expect(scheme.type.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
