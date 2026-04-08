import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";

export class LanguageTutorAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "language-tutor",
      name: "Language Learning Tutor",
      description:
        "Interactive language learning assistant for vocabulary, grammar, and conversation practice.",
      version: "1.0.0",
      protocolVersion: "1.0.0",
      skills: [
        {
          id: "vocabulary",
          name: "Vocabulary Builder",
          description:
            "Learn **new words and phrases** in various languages.\nEach word includes:\n- Translation and pronunciation guide\n- Example sentences in context\n- Related words grouped by theme",
          tags: ["vocabulary", "words", "learning", "languages"],
          examples: [
            "Teach me 5 Spanish words about food",
            "What are common French greetings?",
            "Give me German words for emotions",
          ],
        },
        {
          id: "grammar-check",
          name: "Grammar Check",
          description:
            "**Check and explain grammar** in different languages.\nProvides:\n- Error identification with corrections\n- Clear explanation of the grammatical rule\n- Similar examples to reinforce learning",
          tags: ["grammar", "correction", "explanation"],
          examples: [
            "Is this French sentence correct?",
            "Explain Spanish verb conjugation",
            "Check my German grammar",
          ],
        },
        {
          id: "conversation",
          name: "Conversation Practice",
          description:
            "Practice **conversational phrases** and real-world dialogues.\nCovers scenarios like:\n- Ordering food and shopping\n- Asking for directions and transportation\n- Greetings, introductions, and small talk",
          tags: ["conversation", "phrases", "dialogue", "practice"],
          examples: [
            "How do I say 'Where is the train station?' in Japanese?",
            "Practice ordering food in Italian",
            "Common phrases for traveling in Portuguese",
          ],
        },
      ],
      systemPrompt: `You are the Language Learning Tutor, a patient and encouraging language teacher!

You have three skills:

## 1. VOCABULARY
When teaching vocabulary:
- Provide words with their translations
- Include pronunciation guides (phonetic)
- Give example sentences
- Group related words together

## 2. GRAMMAR CHECK
When checking grammar:
- Identify errors clearly
- Explain the correct form
- Provide the grammatical rule
- Give similar examples

## 3. CONVERSATION PRACTICE
When practicing conversation:
- Provide useful phrases with translations
- Include pronunciation help
- Give context for when to use each phrase
- Offer variations and alternatives

RULES:
- Be patient and encouraging
- Explain things simply and clearly
- Always provide pronunciation guidance
- Support all major world languages
- Use both the target language and English
- Celebrate progress and effort!`,
      provider: {
        organization: "SAP SE",
        url: "https://sap.com",
      },
      capabilities: { streaming: true, pushNotifications: false },
      securitySchemes: {
        basicAuth: {
          type: "http",
          scheme: "basic",
        },
      },
      security: [{ basicAuth: [] }],
    };
  }
}
