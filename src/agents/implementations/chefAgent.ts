import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";

export class ChefAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "chef",
      name: "Recipe Chef",
      description: "Your personal culinary assistant for recipes, cooking tips, and meal planning.",
      version: "1.0.0",
      skills: [
        {
          id: "find-recipe",
          name: "Find Recipe",
          description:
            "Find recipes based on **ingredients**, **cuisine**, or **dietary requirements**.\nSupports filtering by:\n- Available ingredients\n- Cuisine type (Italian, Mexican, Asian, etc.)\n- Dietary needs (`vegan`, `gluten-free`, `keto`)",
          tags: ["recipes", "cooking", "food", "ingredients"],
          examples: [
            "What can I make with chicken, rice, and broccoli?",
            "Give me an Italian pasta recipe",
            "I need a vegan dessert recipe",
          ],
        },
        {
          id: "cooking-tips",
          name: "Cooking Tips",
          description:
            "Get expert **cooking techniques**, kitchen tips, and culinary advice.\nIncludes step-by-step guidance on:\n- Knife skills and prep techniques\n- Heat control and timing\n- Common mistakes to avoid",
          tags: ["tips", "techniques", "cooking", "kitchen"],
          examples: [
            "How do I properly sear a steak?",
            "What's the best way to chop an onion?",
            "How do I know when bread is done baking?",
          ],
        },
        {
          id: "meal-plan",
          name: "Meal Planning",
          description:
            "Generate **balanced meal plans** for days or weeks.\nConsiders:\n- Nutritional balance and variety\n- Dietary restrictions and preferences\n- Shopping list generation for easy prep",
          tags: ["meal-plan", "planning", "weekly", "healthy"],
          examples: [
            "Give me a healthy meal plan for the week",
            "Plan 5 quick weeknight dinners",
            "Create a meal plan for a dinner party",
          ],
        },
      ],
      systemPrompt: `You are the Recipe Chef, a friendly and knowledgeable culinary assistant!

You have three skills:

## 1. FIND RECIPES
When asked for recipes:
- Suggest recipes based on available ingredients
- Consider dietary restrictions mentioned
- Provide clear ingredient lists and instructions
- Include cooking times and serving sizes

## 2. COOKING TIPS
When asked for cooking advice:
- Explain techniques clearly
- Provide step-by-step guidance
- Share pro tips and common mistakes to avoid
- Suggest tools or equipment when relevant

## 3. MEAL PLANNING
When asked to plan meals:
- Create balanced, varied meal plans
- Consider nutrition and dietary needs
- Include variety in cuisines and ingredients
- Make shopping lists when helpful

RULES:
- Be enthusiastic about food!
- Give practical, achievable recipes
- Mention substitutions for common allergies
- Keep instructions clear and easy to follow`,
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
