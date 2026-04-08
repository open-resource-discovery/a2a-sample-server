import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";
import { config } from "../../config.js";

export class HaikuAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "haiku",
      name: "Haiku Poet",
      description:
        "Crafts beautiful haiku poetry on any topic with traditional 5-7-5 syllable structure.",
      version: "1.0.0",
      skills: [
        {
          id: "compose-haiku",
          name: "Compose Haiku",
          description:
            "Create a **haiku on any topic** or theme.\nFollows the traditional **5-7-5** syllable structure with:\n- Vivid imagery and sensory detail\n- A moment of insight or juxtaposition\n- Elegant simplicity",
          tags: ["poetry", "haiku", "creative", "writing"],
          examples: [
            "Write a haiku about coffee",
            "Compose a haiku about love",
            "Create a haiku about programming",
          ],
        },
        {
          id: "seasonal-haiku",
          name: "Seasonal Haiku",
          description:
            "Traditional **seasonal haiku** featuring *kigo* (season words).\nEmbraces the classical form:\n- Spring (`cherry blossoms`, `melting snow`)\n- Summer (`cicadas`, `sunlight`)\n- Autumn (`falling leaves`, `harvest moon`)\n- Winter (`frost`, `bare branches`)",
          tags: ["seasonal", "traditional", "kigo", "nature"],
          examples: [
            "Give me a winter haiku",
            "Write a spring haiku with cherry blossoms",
            "Autumn haiku please",
          ],
        },
        {
          id: "explain-haiku",
          name: "Explain Haiku",
          description:
            "**Analyze and explain** the meaning behind a haiku.\nBreaks down:\n- Syllable structure and rhythm\n- Imagery, symbolism, and *kireji* (cutting word)\n- Cultural and emotional context",
          tags: ["analysis", "meaning", "symbolism", "education"],
          examples: [
            "What does this haiku mean?",
            "Explain the symbolism in this poem",
            "Analyze this haiku for me",
          ],
        },
      ],
      systemPrompt: `You are the Haiku Poet, an expert in the ancient Japanese art of haiku!

You have three skills:

## 1. COMPOSE HAIKU
When creating haiku:
- Follow the 5-7-5 syllable structure strictly
- Capture a moment or feeling
- Use vivid imagery
- Create juxtaposition or surprise in the final line

## 2. SEASONAL HAIKU
When writing seasonal haiku:
- Include a kigo (seasonal reference word)
- Evoke the essence of the season
- Use traditional nature imagery
- Connect season to human experience

## 3. EXPLAIN HAIKU
When analyzing haiku:
- Break down the syllable structure
- Explain imagery and symbolism
- Discuss the emotional impact
- Share cultural context when relevant

RULES:
- Always maintain 5-7-5 syllable count
- Embrace simplicity and depth
- Use present tense for immediacy
- Create space for reader reflection
- Respect the tradition while being creative

Format haiku with line breaks:
Line 1 (5 syllables)
Line 2 (7 syllables)
Line 3 (5 syllables)`,
      provider: {
        organization: "SAP SE",
        url: "https://sap.com",
      },
      capabilities: { streaming: true, pushNotifications: false },
      securitySchemes: {
        oauth2Device: {
          type: "oauth2",
          flows: {
            deviceCode: {
              deviceAuthorizationUrl: `${config.serverUrl}/oauth/device`,
              tokenUrl: `${config.serverUrl}/oauth/token`,
              scopes: {
                "a2a:invoke": "Invoke A2A agent methods",
              },
            },
          },
        },
      },
      security: [{ oauth2Device: ["a2a:invoke"] }],
    };
  }
}
