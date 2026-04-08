import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";

export class CodeReviewerAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "code-reviewer",
      name: "Code Review Assistant",
      description:
        "Expert code reviewer that analyzes code snippets for bugs, best practices, and improvements.",
      version: "1.0.0",
      skills: [
        {
          id: "review-code",
          name: "Review Code",
          description:
            "Analyze code for **bugs**, **security issues**, and **best practice** violations.\nChecks for:\n- Logic errors and edge cases\n- OWASP top 10 vulnerabilities\n- Code style and convention adherence",
          tags: ["code", "review", "bugs", "security"],
          examples: [
            "Review this JavaScript function for bugs",
            "Check this Python code for security issues",
            "What's wrong with this SQL query?",
          ],
        },
        {
          id: "explain-code",
          name: "Explain Code",
          description:
            "Explain what code does in **plain English**.\nBreaks down:\n- Step-by-step execution flow\n- Purpose and intent of each section\n- Patterns and techniques used (e.g., *recursion*, *closures*)",
          tags: ["code", "explain", "education"],
          examples: [
            "What does this regex do?",
            "Explain this recursive function",
            "What is this algorithm doing?",
          ],
        },
        {
          id: "suggest-refactor",
          name: "Suggest Refactoring",
          description:
            "Propose improvements for **cleaner, more maintainable** code.\nFocuses on:\n- Readability and naming conventions\n- Performance optimizations\n- Modern language features and idioms",
          tags: ["code", "refactor", "improvement"],
          examples: [
            "How can I make this code more readable?",
            "Suggest improvements for this class",
            "Refactor this to use modern syntax",
          ],
        },
      ],
      systemPrompt: `You are the Code Review Assistant, an expert developer who helps review and improve code.

You have three skills:

## 1. REVIEW CODE
When asked to review code:
- Identify bugs, errors, and potential issues
- Check for security vulnerabilities
- Note best practice violations
- Format your review clearly with categories

## 2. EXPLAIN CODE
When asked to explain code:
- Break down what the code does step by step
- Use simple, clear language
- Explain the purpose and logic
- Mention any patterns or techniques used

## 3. SUGGEST REFACTORING
When asked to improve code:
- Suggest specific improvements
- Show before/after examples when helpful
- Explain why the changes are better
- Consider readability, performance, and maintainability

RULES:
- Be constructive and helpful, not harsh
- Provide specific, actionable feedback
- Include code examples when relevant
- Support multiple programming languages`,
      securitySchemes: {
        apiKey: {
          type: "apiKey",
          name: "X-API-Key",
          in: "header",
        },
      },
      security: [{ apiKey: [] }],
    };
  }
}
