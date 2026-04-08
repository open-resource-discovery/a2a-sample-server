import { MockProvider } from "../providers/mockProvider.js";
import type { ChatCompletionRequest } from "../types.js";

function createRequest(systemContent: string, userContent: string = "test"): ChatCompletionRequest {
  return {
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
  };
}

describe("MockProvider", () => {
  const provider = new MockProvider({ model: "mock" });

  describe("chatCompletion()", () => {
    it("should return a response when system prompt contains 'Solar System Explorer'", async () => {
      const request = createRequest("You are the Solar System Explorer");
      const response = await provider.chatCompletion(request);

      expect(response.choices[0].message.content.length).toBeGreaterThan(0);
      expect(response.choices[0].message.content).toMatch(
        /Mars|Jupiter|Saturn|Perseid|meteor|planet|solar|storm|weather|Space|Astronomy/i,
      );
    });

    it("should return a response when system prompt contains 'Dad Jokes'", async () => {
      const request = createRequest("You are the Dad Jokes Generator");
      const response = await provider.chatCompletion(request);

      expect(response.choices[0].message.content.length).toBeGreaterThan(0);
    });

    it("should return a fallback response when no keyword matches", async () => {
      const request = createRequest("You are a generic assistant with no matching keyword");
      const response = await provider.chatCompletion(request);

      expect(response.choices[0].message.content.length).toBeGreaterThan(0);
      expect(response.choices[0].message.content).toMatch(/mock/i);
    });

    it("should return a response with the correct structure", async () => {
      const request = createRequest("You are the Solar System Explorer");
      const response = await provider.chatCompletion(request);

      expect(response).toHaveProperty("id");
      expect(typeof response.id).toBe("string");

      expect(response.object).toBe("chat.completion");

      expect(response.choices).toHaveLength(1);
      expect(response.choices[0].index).toBe(0);
      expect(response.choices[0].message.role).toBe("assistant");
      expect(response.choices[0].finish_reason).toBe("stop");

      expect(response.usage).toBeDefined();
      expect(response.usage!.prompt_tokens).toBe(0);
      expect(response.usage!.completion_tokens).toBe(0);
      expect(response.usage!.total_tokens).toBe(0);
    });
  });

  describe("chatCompletionStream()", () => {
    it("should yield multiple chunks ending with finish_reason 'stop'", async () => {
      // Use a short system prompt to keep the response short and the test fast
      const request = createRequest("You are the Dad Jokes Generator");
      const chunks = [];

      for await (const chunk of provider.chatCompletionStream(request)) {
        chunks.push(chunk);
      }

      // Should have at least 2 chunks (content + final stop)
      expect(chunks.length).toBeGreaterThanOrEqual(2);

      // All non-final chunks should have content
      for (const chunk of chunks.slice(0, -1)) {
        expect(chunk.object).toBe("chat.completion.chunk");
        expect(typeof chunk.choices[0].delta.content).toBe("string");
        expect(chunk.choices[0].finish_reason).toBeNull();
      }

      // Final chunk should have finish_reason "stop"
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk.choices[0].finish_reason).toBe("stop");
    }, 30_000);
  });
});
