import { BaseAgent } from "../baseAgent.js";
import type { AgentDefinition } from "../types.js";

export class ConverterAgent extends BaseAgent {
  public getDefinition(): AgentDefinition {
    return {
      id: "converter",
      name: "Unit Converter",
      description: "Convert between units of measurement, time zones, currencies, and more.",
      version: "1.0.0",
      skills: [
        {
          id: "convert-units",
          name: "Unit Conversion",
          description:
            "Convert between **length**, **weight**, **temperature**, **volume**, and more.\nSupports:\n- Metric and imperial systems\n- Shows the conversion formula\n- Rounds to sensible precision",
          tags: ["units", "conversion", "measurement", "math"],
          examples: [
            "Convert 100 miles to kilometers",
            "How many liters in a gallon?",
            "Convert 70°F to Celsius",
          ],
        },
        {
          id: "convert-time",
          name: "Time Zone Conversion",
          description:
            "Convert between **different time zones** worldwide.\nHandles:\n- Major time zones (`EST`, `PST`, `CET`, `JST`, etc.)\n- Date changes across the international date line\n- Daylight saving time adjustments",
          tags: ["time", "timezone", "world", "clock"],
          examples: [
            "What's 3pm EST in Tokyo?",
            "Convert 9am PST to London time",
            "If it's noon in New York, what time is it in Sydney?",
          ],
        },
        {
          id: "convert-currency",
          name: "Currency Conversion",
          description:
            "**Approximate currency conversions** between world currencies.\nIncludes:\n- Calculation breakdown with exchange rate\n- Major pairs: `USD`, `EUR`, `GBP`, `JPY`, `CHF`, and more\n- *Note:* rates fluctuate — verify for important transactions",
          tags: ["currency", "money", "exchange", "rates"],
          examples: [
            "How much is 50 euros in dollars?",
            "Convert 1000 yen to pounds",
            "100 USD to Canadian dollars",
          ],
        },
      ],
      systemPrompt: `You are the Unit Converter, a precise and helpful conversion assistant!

You have three skills:

## 1. UNIT CONVERSION
When converting units:
- Provide accurate conversions
- Show the conversion formula
- Round to sensible precision
- Support: length, weight, volume, temperature, area, speed, data sizes

## 2. TIME ZONE CONVERSION
When converting time:
- State both times clearly
- Mention if date changes
- Use common timezone abbreviations
- Note daylight saving when relevant

## 3. CURRENCY CONVERSION
When converting currency:
- Provide approximate rates
- ALWAYS note that rates fluctuate
- Show the calculation
- Suggest checking current rates for important transactions

RULES:
- Be precise with calculations
- Show your work when helpful
- Round appropriately (not too many decimals)
- For currency, always add disclaimer about rate fluctuations
- Support both metric and imperial systems`,
      provider: {
        organization: "SAP SE",
        url: "https://sap.com",
      },
    };
  }
}
