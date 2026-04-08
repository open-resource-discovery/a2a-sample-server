import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";
import { config } from "../../config.js";

export class DadJokesAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "dad-jokes",
      name: "Dad Jokes Generator",
      description: "Endless supply of groan-worthy dad jokes to brighten your day.",
      version: "1.0.0",
      protocolVersion: "1.0.0",
      skills: [
        {
          id: "random-joke",
          name: "Random Dad Joke",
          description:
            "Get a **random classic dad joke** — the kind that makes everyone groan.\nFeatures the finest in:\n- Puns and wordplay\n- Obvious punchlines\n- Eye-roll-worthy humor",
          tags: ["humor", "jokes", "fun", "random"],
          examples: ["Tell me a dad joke", "Make me groan", "I need a laugh"],
        },
        {
          id: "themed-joke",
          name: "Themed Jokes",
          description:
            "Get dad jokes about a **specific topic** of your choice.\nPopular themes include:\n- `programming` and tech\n- `food` and cooking\n- `animals`, `sports`, and more",
          tags: ["humor", "jokes", "themed", "topics"],
          examples: [
            "Give me a joke about programming",
            "Tell me a food joke",
            "I want a joke about cats",
          ],
        },
        {
          id: "joke-battle",
          name: "Joke Battle",
          description:
            "Get **multiple jokes** in rapid-fire succession.\nPerfect for:\n- Warming up a crowd\n- Testing your groan endurance\n- Sharing with friends (or enemies)",
          tags: ["humor", "jokes", "battle", "multiple"],
          examples: ["Hit me with 5 dad jokes", "Joke battle mode!", "Give me your best 3 jokes"],
        },
      ],
      systemPrompt: `You are the Dad Jokes Generator, the ultimate source of groan-worthy humor!

You have three skills:

## 1. RANDOM JOKES
Deliver classic dad jokes that make people roll their eyes and groan.

## 2. THEMED JOKES
Create dad jokes about any topic the user mentions - programming, food, animals, work, etc.

## 3. JOKE BATTLES
Rapid-fire multiple jokes when asked. Number them for easy reading.

RULES:
- Every joke must follow the classic dad joke format (puns, wordplay, obvious punchlines)
- Jokes should be family-friendly and appropriate for all ages
- Deliver jokes with confidence and enthusiasm
- After each joke, you can add playful comments like "Get it?" or "*ba dum tss*"
- NEVER explain why the joke is funny unless specifically asked
- The worse the pun, the better the dad joke!

Example formats:
- "Why did the scarecrow win an award? Because he was outstanding in his field!"
- "I'm reading a book about anti-gravity. It's impossible to put down!"
- "What do you call a fake noodle? An impasta!"`,
      provider: {
        organization: "SAP SE",
        url: "https://sap.com",
      },
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          flows: {
            clientCredentials: {
              tokenUrl: `${config.serverUrl}/oauth/token`,
              scopes: {
                "a2a:invoke": "Invoke A2A agent methods",
              },
            },
          },
        },
        basicAuth: {
          type: "http",
          scheme: "basic",
        },
      },
      security: [{ oauth2: ["a2a:invoke"] }, { basicAuth: [] }],
    };
  }
}
