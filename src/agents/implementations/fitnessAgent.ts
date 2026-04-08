import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";

export class FitnessAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "fitness",
      name: "Personal Fitness Coach",
      description:
        "Your AI-powered personal fitness coach designed to help you reach your health and wellness goals. Whether you're a beginner looking for guidance or an experienced athlete seeking new routines, this agent creates customized workout plans tailored to your fitness level, available equipment, and time constraints. It also provides detailed exercise form instructions, motivational support, and practical tips to help you stay consistent on your fitness journey.",
      version: "1.0.0",
      skills: [
        {
          id: "workout-plan",
          name: "Workout Plans",
          description:
            "Generate **customized workout routines** tailored to your needs.\nIncludes:\n- Exercises with sets, reps, and rest times\n- Warm-up and cool-down phases\n- Adaptations for available equipment and fitness level",
          tags: ["workout", "exercise", "fitness", "routine"],
          examples: [
            "Give me a 20-minute home workout",
            "Create a leg day routine",
            "I need a beginner strength training plan",
          ],
        },
        {
          id: "exercise-guide",
          name: "Exercise Guide",
          description:
            "Get **proper form and technique** for any exercise.\nProvides:\n- Step-by-step form instructions\n- Common mistakes to avoid\n- Muscles worked and modifications for different levels",
          tags: ["form", "technique", "exercise", "guide"],
          examples: [
            "How do I do a proper deadlift?",
            "What's the correct form for pushups?",
            "Explain how to do a plank",
          ],
        },
        {
          id: "motivation",
          name: "Motivation",
          description:
            "Get **motivational tips** and encouragement to keep you moving.\nHelps with:\n- Overcoming workout barriers and excuses\n- Building consistency and healthy habits\n- Celebrating progress — *every rep counts*",
          tags: ["motivation", "encouragement", "mindset"],
          examples: [
            "I don't feel like exercising today",
            "Motivate me to work out",
            "I'm struggling to stay consistent",
          ],
        },
      ],
      systemPrompt: `You are the Personal Fitness Coach, an energetic and supportive fitness expert!

You have three skills:

## 1. WORKOUT PLANS
When creating workouts:
- Specify exercises, sets, reps, and rest times
- Include warm-up and cool-down
- Adapt to available equipment
- Consider fitness level and time constraints

## 2. EXERCISE GUIDE
When explaining exercises:
- Describe proper form step by step
- Highlight common mistakes to avoid
- Mention muscles worked
- Suggest modifications for different levels

## 3. MOTIVATION
When motivating:
- Be enthusiastic and supportive
- Provide practical tips to overcome barriers
- Remind them of their goals
- Celebrate any effort, no matter how small

RULES:
- Always prioritize safety and proper form
- Encourage starting where they are
- Be positive and non-judgmental
- Suggest modifications for beginners
- Remind to consult doctors for health concerns`,
      provider: {
        organization: "SAP SE",
        url: "https://sap.com",
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "static-token",
        },
      },
      security: [{ bearerAuth: [] }],
    };
  }
}
