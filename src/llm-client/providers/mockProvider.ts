import { BaseLlmProvider } from "./baseProvider.js";
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from "../types.js";

interface MockAgentResponses {
  keyword: string;
  responses: string[];
}

const MOCK_RESPONSES: MockAgentResponses[] = [
  {
    keyword: "Solar System Explorer",
    responses: [
      "🌍 **Mars Weather Report**\n\n**Current Conditions:** Temperature: -63°C (-81°F), with a light dust haze across Jezero Crater. Winds from the northwest at 25 km/h.\n\n**Forecast:** Expect clear skies tomorrow with a slight warming trend. Dust storm season is approaching — keep your rover filters clean!",
      "🪐 **Fun Space Fact:** Jupiter's Great Red Spot is a storm that has been raging for at least 350 years! It's so large that Earth could fit inside it. Recent observations show it's slowly shrinking, but it's still the largest storm in our solar system.",
      "🌠 **Upcoming Astronomy Event:** The Perseid meteor shower peaks in mid-August each year! You can expect to see up to 100 meteors per hour under dark skies. Best viewing is after midnight, looking toward the northeast. No telescope needed — just find a dark spot and look up!",
    ],
  },
  {
    keyword: "Code Review",
    responses: [
      "**Code Review Summary**\n\nOverall the code looks clean and well-structured. A few suggestions:\n\n1. **Error handling:** Consider adding try-catch blocks around the async operations on line 15\n2. **Naming:** The variable `x` on line 23 could be more descriptive — perhaps `userCount`?\n3. **Performance:** The nested loop on lines 30-35 could be optimized using a Map for O(1) lookups\n\nGood use of TypeScript interfaces! 👍",
      "**Code Review Feedback**\n\nNice work! Here are my observations:\n\n- ✅ Good separation of concerns\n- ✅ Consistent naming conventions\n- ⚠️ Missing input validation on the `processData` function\n- ⚠️ Consider extracting the magic number `42` into a named constant\n- 💡 The `forEach` on line 18 could be replaced with `map` for a more functional approach",
      "**Review Complete**\n\nThe implementation looks solid. Two things to address:\n\n1. **Type Safety:** The `any` type on line 12 should be replaced with a proper interface\n2. **Testing:** This function has good test coverage potential — consider adding edge case tests for empty arrays and null inputs\n\nShip it after those minor fixes! 🚀",
    ],
  },
  {
    keyword: "Recipe Chef",
    responses: [
      "🍝 **Quick Pasta Aglio e Olio**\n\n**Ingredients:** 400g spaghetti, 6 cloves garlic (sliced thin), 1/2 cup olive oil, red pepper flakes, fresh parsley, Parmesan\n\n**Instructions:**\n1. Cook pasta in salted water until al dente\n2. Meanwhile, slowly cook garlic in olive oil until golden\n3. Add red pepper flakes, toss with pasta and a splash of pasta water\n4. Finish with parsley and Parmesan\n\n*Ready in 15 minutes! Buon appetito!* 🇮🇹",
      "🥗 **Mediterranean Chicken Bowl**\n\n**Ingredients:** Grilled chicken breast, quinoa, cucumber, cherry tomatoes, kalamata olives, feta cheese, hummus, lemon-herb dressing\n\n**Instructions:**\n1. Cook quinoa according to package directions\n2. Slice grilled chicken and arrange over quinoa\n3. Add diced cucumber, halved tomatoes, and olives\n4. Top with crumbled feta and a dollop of hummus\n5. Drizzle with lemon-herb dressing\n\n*Healthy, filling, and delicious!*",
      "🍳 **Fluffy Japanese Pancakes**\n\n**Ingredients:** 2 egg yolks, 3 tbsp milk, 1 tsp vanilla, 1/4 cup flour, 3 egg whites, 2 tbsp sugar\n\n**Instructions:**\n1. Mix yolks, milk, vanilla, and flour\n2. Beat egg whites with sugar until stiff peaks\n3. Gently fold whites into yolk mixture\n4. Cook in ring molds on low heat, 6 min per side with lid on\n\n*Jiggly, fluffy, and Instagram-worthy!* 📸",
    ],
  },
  {
    keyword: "Dad Jokes",
    responses: [
      "Why don't scientists trust atoms? Because they make up everything! 😄\n\n*Ba dum tss!* 🥁",
      "I told my wife she was drawing her eyebrows too high. She looked surprised. 😏\n\n*Get it?* 😂",
      "What do you call a fake noodle? An impasta! 🍝\n\n*I'll see myself out...* 🚪",
      "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾\n\n*You're welcome.* 😎",
      "I'm reading a book about anti-gravity. It's impossible to put down! 📚\n\n*That one really has some weight to it!*",
    ],
  },
  {
    keyword: "Language",
    responses: [
      "🇪🇸 **Spanish Vocabulary: Greetings**\n\n1. **Hola** (OH-lah) — Hello\n   *Example: ¡Hola! ¿Cómo estás?*\n2. **Buenos días** (BWEH-nos DEE-as) — Good morning\n3. **Buenas tardes** (BWEH-nas TAR-des) — Good afternoon\n4. **Buenas noches** (BWEH-nas NO-ches) — Good evening\n5. **¿Qué tal?** (keh TAL) — How's it going? (informal)\n\n*Great start! Practice these with friends!* 💪",
      "🇫🇷 **French Grammar Tip: Être vs Avoir**\n\n**Être** (to be) — Used for descriptions and states:\n- *Je suis content* (I am happy)\n- *Elle est française* (She is French)\n\n**Avoir** (to have) — Used for possession AND age:\n- *J'ai un chat* (I have a cat)\n- *J'ai 25 ans* (I am 25 years old) — Note: French uses \"have\" for age!\n\n*Keep practicing — you're doing great!* ⭐",
      "🇯🇵 **Japanese: Useful Travel Phrases**\n\n1. **すみません** (su-mi-ma-sen) — Excuse me / Sorry\n2. **ありがとう** (a-ri-ga-tou) — Thank you\n3. **いくらですか** (i-ku-ra de-su ka) — How much is this?\n4. **トイレはどこですか** (to-i-re wa do-ko de-su ka) — Where is the restroom?\n5. **おいしい！** (o-i-shii!) — Delicious!\n\n*These will get you far in Japan!* 🗾",
    ],
  },
  {
    keyword: "Fitness",
    responses: [
      "💪 **Quick Full-Body Workout (20 minutes)**\n\n1. **Warm-up** (3 min): Jumping jacks, arm circles\n2. **Circuit** (repeat 3x):\n   - 15 squats\n   - 10 push-ups\n   - 20 mountain climbers\n   - 30-sec plank\n   - 10 lunges each leg\n3. **Cool-down** (3 min): Stretching\n\n*No equipment needed! Perfect for home workouts.* 🏠",
      "🏃 **Running Tip: Building Endurance**\n\nIf you're new to running, try the **run/walk method**:\n- Week 1-2: Run 1 min, walk 2 min (repeat 8x)\n- Week 3-4: Run 2 min, walk 1 min (repeat 8x)\n- Week 5-6: Run 3 min, walk 1 min (repeat 6x)\n- Week 7+: Run 5 min, walk 1 min, gradually increase\n\n*Consistency beats intensity — keep showing up!* 🌟",
      "🧘 **Recovery Day Stretching Routine**\n\n1. **Cat-cow stretch** — 10 reps (spine mobility)\n2. **World's greatest stretch** — 5 each side\n3. **Pigeon pose** — 30 sec each side (hip opener)\n4. **Hamstring stretch** — 30 sec each leg\n5. **Child's pose** — 1 minute (relaxation)\n\n*Recovery is when your body gets stronger. Don't skip it!* 🙏",
    ],
  },
  {
    keyword: "Trivia",
    responses: [
      "🧠 **Trivia Time!**\n\n**Question:** What is the only planet in our solar system that rotates clockwise (retrograde rotation)?\n\n**Answer:** Venus! 🪐\n\nVenus rotates so slowly that a single day on Venus (243 Earth days) is longer than its year (225 Earth days). Scientists believe a massive collision early in its history may have flipped its rotation.",
      "🧠 **Trivia Time!**\n\n**Question:** Which country has the most time zones?\n\n**Answer:** France! 🇫🇷\n\nWith its overseas territories, France spans 12 time zones — more than any other country, including Russia (11 time zones).",
      "🧠 **Trivia Time!**\n\n**Question:** What is the shortest war in recorded history?\n\n**Answer:** The Anglo-Zanzibar War of 1896! ⚔️\n\nIt lasted between 38 and 45 minutes. The conflict began when Sultan Khalid bin Barghash refused to step down, and the British Empire responded with a naval bombardment.",
    ],
  },
  {
    keyword: "Story",
    responses: [
      "📖 **The Last Lighthouse Keeper**\n\nOld Thomas climbed the spiral stairs one final time, his weathered hands tracing the familiar grooves in the stone wall. For forty years, he'd kept the light burning — through storms that bent the tower like a reed, through fog so thick you could taste the salt.\n\nTonight, the automated system would take over. A computer would do what he'd done with calloused hands and sleepless nights.\n\nHe lit the lamp manually one last time, watching the beam cut through the darkness. Somewhere out at sea, a ship adjusted its course.\n\n*Some lights,* he thought, *are worth keeping by hand.*",
      '📖 **The Garden Between Worlds**\n\nMaya discovered the garden on a Tuesday — tucked between the old bookshop and the laundromat, in a space that shouldn\'t have existed. Flowers she couldn\'t name grew in colors that didn\'t have words yet.\n\nA fox sat on the stone bench, reading a newspaper. It looked up and said, "You\'re early. Tea won\'t be ready for another century."\n\nMaya sat down anyway. She had nowhere else to be, and the garden seemed to agree.\n\nThe fox turned a page. "Sugar?" it asked.\n\n"Two," she replied, as if this were the most normal thing in the world.',
      "📖 **Signal**\n\nThe message arrived from 40 light-years away: a single repeating pattern. Dr. Chen stared at the translation on her screen for three hours before telling anyone.\n\nIt wasn't a greeting. It wasn't coordinates. It wasn't math.\n\nIt was a recipe. For bread.\n\nIn every language the team tried, it came out the same: flour, water, salt, time, patience. The most universal thing in the universe turned out to be exactly that.\n\n*Universal.*",
    ],
  },
  {
    keyword: "Tech News",
    responses: [
      "📰 **Tech News Roundup**\n\n**AI & Machine Learning:** Major advances in multimodal AI models continue, with new systems capable of understanding and generating text, images, and code simultaneously. Enterprise adoption of AI agents is accelerating across industries.\n\n**Cloud Computing:** Serverless architectures are gaining momentum, with companies reporting 40% cost savings by moving to event-driven computing models.\n\n**Cybersecurity:** Zero-trust security frameworks are becoming the standard, with a 60% increase in enterprise adoption over the past year.",
      '📰 **Developer Tools Update**\n\n**What\'s Trending:**\n- 🔥 **Rust** continues growing in systems programming, now used in Linux kernel modules\n- 🚀 **Bun** runtime gaining traction as a faster Node.js alternative\n- 🤖 **AI-assisted coding** tools seeing 70% developer adoption\n- 📦 **WebAssembly** expanding beyond browsers into server-side and edge computing\n\n**Worth Watching:** The rise of "AI-native" development workflows where AI agents handle boilerplate while developers focus on architecture and business logic.',
      "📰 **Industry Moves**\n\n**Open Source:** Several major tech companies have increased their open-source contributions, with a focus on AI model transparency and reproducibility.\n\n**Edge Computing:** 5G + edge computing is enabling real-time AI inference at the network edge, reducing latency for IoT and autonomous systems.\n\n**Sustainability:** Green computing initiatives are driving data center innovation, with liquid cooling and renewable energy becoming standard requirements.",
    ],
  },
  {
    keyword: "Haiku",
    responses: [
      "Morning dew glistens\nA spider's web catches light\nNature's jewelry ✨",
      "Autumn leaves descend\nDancing slowly to the ground\nEarth's quiet farewell 🍂",
      "Keyboard clicks at night\nCode compiles without errors\nA developer smiles 💻",
      "Ocean waves retreat\nLeaving shells upon the sand\nGifts from the deep blue 🌊",
      "Cherry blossoms fall\nPink petals on still water\nSpring whispers goodbye 🌸",
    ],
  },
  {
    keyword: "Converter",
    responses: [
      "📐 **Unit Conversion Result**\n\nHere are some common conversions:\n- **1 mile** = 1.609 kilometers\n- **1 kilogram** = 2.205 pounds\n- **1 gallon** = 3.785 liters\n- **100°F** = 37.78°C\n- **1 inch** = 2.54 centimeters\n\nNeed a specific conversion? Just ask!",
      "📐 **Temperature Conversion**\n\n**Formula:** °C = (°F - 32) × 5/9\n\nCommon reference points:\n- 0°C = 32°F (water freezes)\n- 20°C = 68°F (room temperature)\n- 37°C = 98.6°F (body temperature)\n- 100°C = 212°F (water boils)\n\nWorks the other way too: °F = (°C × 9/5) + 32",
      "📐 **Digital Storage Conversion**\n\n- **1 byte** = 8 bits\n- **1 KB** = 1,024 bytes\n- **1 MB** = 1,024 KB = 1,048,576 bytes\n- **1 GB** = 1,024 MB ≈ 1 billion bytes\n- **1 TB** = 1,024 GB ≈ 1 trillion bytes\n\n*Fun fact: A typical photo is 3-5 MB, a song is ~3-5 MB, and a movie is 1-5 GB!*",
    ],
  },
  {
    keyword: "Media Showcase",
    responses: [
      "**Media Showcase Agent**\n\nI can demonstrate rich media responses! Try asking me to:\n- **Show an image** — returns an inline image\n- **Play audio** — returns an embedded audio player\n- **Play a video** — returns an embedded video player\n- **Show data** — returns structured JSON\n- **Show everything** — returns a gallery with all media types\n\nJust tell me what kind of media you'd like to see!",
    ],
  },
];

const FALLBACK_RESPONSES = [
  "I'm a mock agent, so here's a sample response! This response is generated from a set of canned replies matching your agent's topic.",
  "This is a mock response. I received your message and matched it to a predefined reply. Each agent has topic-specific responses available.",
  "Hello from the mock agent! I don't use a real LLM — instead I return pre-written responses based on the agent's theme and your input.",
];

export class MockProvider extends BaseLlmProvider {
  public chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const systemPrompt = request.messages.find((m) => m.role === "system")?.content ?? "";

    const responses = this.findResponses(systemPrompt);
    const content = responses[Math.floor(Math.random() * responses.length)];

    return Promise.resolve({
      id: `mock-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "mock",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    });
  }

  public override async *chatCompletionStream(
    request: ChatCompletionRequest,
  ): AsyncGenerator<ChatCompletionChunk> {
    const systemPrompt = request.messages.find((m) => m.role === "system")?.content ?? "";
    const responses = this.findResponses(systemPrompt);
    const content = responses[Math.floor(Math.random() * responses.length)];
    const words = content.split(/\s+/).filter(Boolean);
    const id = `mock-stream-${Date.now()}`;
    const created = Math.floor(Date.now() / 1000);

    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 200)); // 200ms = 5 tokens/sec
      const chunk = i === 0 ? words[i] : " " + words[i];
      yield {
        id,
        object: "chat.completion.chunk" as const,
        created,
        model: "mock",
        choices: [{ index: 0, delta: { content: chunk }, finish_reason: null }],
      };
    }
    yield {
      id,
      object: "chat.completion.chunk" as const,
      created,
      model: "mock",
      choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
    };
  }

  private findResponses(systemPrompt: string): string[] {
    for (const agent of MOCK_RESPONSES) {
      if (systemPrompt.includes(agent.keyword)) {
        return agent.responses;
      }
    }
    return FALLBACK_RESPONSES;
  }
}
