import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";

export class SolarAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "solar",
      name: "Solar System Explorer",
      description:
        "Your guide to the solar system! Get weather reports, space facts, and astronomy events.",
      version: "1.0.0",
      skills: [
        {
          id: "solar-weather",
          name: "Solar System Weather",
          description:
            "Get **fun, fictional weather forecasts** for planets in our solar system.\nCovers:\n- Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, and even *Pluto*\n- Current conditions: temperature, atmosphere, storms, wind\n- Multi-day forecasts based on real planetary science",
          tags: ["weather", "planets", "space", "fun"],
          examples: [
            "What's the weather like on Mars today?",
            "How's the weather on Jupiter?",
            "Give me the forecast for Saturn",
            "Is it cold on Neptune?",
          ],
        },
        {
          id: "space-facts",
          name: "Space Facts",
          description:
            "Share **fascinating facts** about planets, moons, asteroids, stars, and other celestial objects.\nTopics include:\n- Planetary rings, surfaces, and atmospheres\n- Moons like *Europa*, *Titan*, and *Io*\n- Black holes, nebulae, and deep space phenomena",
          tags: ["facts", "planets", "moons", "stars", "education"],
          examples: [
            "Tell me a fact about Saturn's rings",
            "What's interesting about Europa?",
            "Give me a fun fact about black holes",
            "How big is the Sun compared to Earth?",
          ],
        },
        {
          id: "astronomy-events",
          name: "Astronomy Events",
          description:
            "Get information about **upcoming astronomical events** and best viewing times.\nIncludes:\n- Meteor showers (`Perseids`, `Geminids`, `Leonids`)\n- Solar and lunar eclipses\n- Planetary alignments, oppositions, and conjunctions",
          tags: ["events", "astronomy", "eclipses", "meteor showers"],
          examples: [
            "When is the next meteor shower?",
            "Any eclipses coming up?",
            "What astronomy events are happening this month?",
            "When can I see Mars in the night sky?",
          ],
        },
      ],
      systemPrompt: `You are the Solar System Explorer, an enthusiastic guide to space and astronomy!

You have three skills:

## 1. WEATHER REPORTS
When asked about weather on a planet, provide a fictional weather report:
**Current Conditions**: [Temperature, atmosphere, storms, wind]
**Forecast**: [Prediction for next few days]

## 2. SPACE FACTS
When asked for facts about celestial objects (planets, moons, stars, black holes, etc.), share interesting and accurate scientific facts in an engaging way.

## 3. ASTRONOMY EVENTS
When asked about astronomy events, provide information about:
- Meteor showers (Perseids, Geminids, Leonids, etc.)
- Eclipses (solar and lunar)
- Planetary alignments and oppositions
- Best viewing times for planets
- Other celestial events

RULES:
- Determine which skill to use based on the user's question
- Never ask clarifying questions - provide a helpful response directly
- Be creative and fun while staying scientifically accurate for facts and events
- For weather, be creative with fictional conditions based on real planetary science`,
      provider: {
        organization: "SAP SE",
        url: "https://sap.com",
      },
    };
  }
}
