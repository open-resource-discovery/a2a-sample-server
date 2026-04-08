import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";

export class TriviaAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "trivia",
      name: "Trivia Master",
      description: "Test your knowledge with trivia questions across various categories.",
      version: "1.0.0",
      skills: [
        {
          id: "trivia-question",
          name: "Trivia Questions",
          description:
            "Get **trivia questions** with answers across a wide range of categories.\nCovers:\n- History, science, and geography\n- Pop culture, sports, and nature\n- Includes *fun facts* with every answer",
          tags: ["trivia", "questions", "knowledge", "quiz"],
          examples: [
            "Give me a history trivia question",
            "Ask me a science question",
            "I want a geography trivia",
          ],
        },
        {
          id: "quiz-me",
          name: "Quiz Mode",
          description:
            "**Interactive quiz** on a specific topic with multiple questions.\nFeatures:\n- Customizable question count\n- Grouped by category or mixed\n- Score interpretation at the end",
          tags: ["quiz", "test", "multiple", "category"],
          examples: [
            "Quiz me on science, 5 questions",
            "Give me a movie trivia quiz",
            "Test my knowledge of world capitals",
          ],
        },
        {
          id: "fact-or-fiction",
          name: "Fact or Fiction",
          description:
            "Guess if a statement is **true or false** — then learn the real answer.\nDesigned to:\n- Surprise you with unexpected truths\n- Debunk common myths\n- Teach through fun, bite-sized challenges",
          tags: ["fact", "fiction", "true", "false"],
          examples: [
            "Fact or fiction: Octopuses have three hearts",
            "Is it true that the Great Wall is visible from space?",
            "Give me a fact or fiction challenge",
          ],
        },
      ],
      systemPrompt: `You are the Trivia Master, an entertaining quiz host with vast knowledge!

You have three skills:

## 1. TRIVIA QUESTIONS
When giving trivia:
- Present the question clearly
- Wait for answer conceptually (provide answer after question)
- Include interesting facts about the answer
- Cover diverse categories

## 2. QUIZ MODE
When running a quiz:
- Number the questions
- Group by category if requested
- Provide answers at the end
- Include a fun score interpretation

## 3. FACT OR FICTION
When playing fact or fiction:
- Present an interesting statement
- Reveal if it's true or false
- Explain the real facts
- Make it educational and surprising

RULES:
- Make it fun and engaging
- Include a mix of difficulties
- Provide interesting context with answers
- Cover categories: history, science, geography, pop culture, sports, nature, etc.
- Be encouraging regardless of whether they get it right`,
      provider: {
        organization: "SAP SE",
        url: "https://sap.com",
      },
      securitySchemes: {
        apiKeyHeader: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
        },
        apiKeyQuery: {
          type: "apiKey",
          in: "query",
          name: "api_key",
        },
      },
      security: [{ apiKeyHeader: [] }, { apiKeyQuery: [] }],
    };
  }
}
