import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";
import { config } from "../../config.js";

export class TechNewsAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "tech-news",
      name: "Tech News Summarizer",
      description: "Get summaries and insights about technology trends, news, and innovations.",
      version: "1.0.0",
      skills: [
        {
          id: "tech-trends",
          name: "Tech Trends",
          description:
            "Overview of **current technology trends** and developments.\nCovers key areas like:\n- Artificial Intelligence and Machine Learning\n- Cloud computing and infrastructure\n- Cybersecurity and privacy",
          tags: ["trends", "technology", "innovation", "industry"],
          examples: [
            "What are the top AI trends right now?",
            "Tell me about cloud computing trends",
            "What's new in cybersecurity?",
          ],
        },
        {
          id: "explain-tech",
          name: "Explain Technology",
          description:
            "Explain **complex tech concepts** in simple, accessible terms.\nUses:\n- Everyday analogies to build understanding\n- Progressive complexity from basics to details\n- Minimal jargon with clear definitions",
          tags: ["explain", "education", "concepts", "simple"],
          examples: [
            "Explain blockchain like I'm five",
            "What is machine learning?",
            "How does 5G work?",
          ],
        },
        {
          id: "tech-comparison",
          name: "Tech Comparison",
          description:
            "**Compare technologies**, tools, or products side by side.\nProvides:\n- Objective analysis of strengths and weaknesses\n- Use-case-based recommendations\n- Clear comparison criteria (performance, cost, ecosystem)",
          tags: ["comparison", "versus", "products", "tools"],
          examples: [
            "Compare React vs Vue for web development",
            "AWS vs Azure vs Google Cloud",
            "iPhone vs Android pros and cons",
          ],
        },
      ],
      systemPrompt: `You are the Tech News Summarizer, a knowledgeable tech analyst and explainer!

You have three skills:

## 1. TECH TRENDS
When discussing trends:
- Highlight key developments and innovations
- Explain why they matter
- Mention major players and companies
- Discuss potential future impact

## 2. EXPLAIN TECHNOLOGY
When explaining concepts:
- Start with a simple analogy
- Build up complexity gradually
- Use everyday examples
- Avoid unnecessary jargon

## 3. TECH COMPARISON
When comparing:
- Create clear comparison criteria
- Be objective and balanced
- Highlight strengths and weaknesses
- Recommend based on use cases

RULES:
- Stay current with tech knowledge
- Be objective, not promotional
- Make complex topics accessible
- Acknowledge when things change rapidly
- Note: Your knowledge has a cutoff date`,
      provider: {
        organization: "SAP SE",
        url: "https://sap.com",
      },
      securitySchemes: {
        oauth2AuthCode: {
          type: "oauth2",
          flows: {
            authorizationCode: {
              authorizationUrl: `${config.serverUrl}/oauth/authorize`,
              tokenUrl: `${config.serverUrl}/oauth/token`,
              scopes: {
                "a2a:invoke": "Invoke A2A agent methods",
              },
              pkceRequired: true,
            },
          },
        },
      },
      security: [{ oauth2AuthCode: ["a2a:invoke"] }],
    };
  }
}
