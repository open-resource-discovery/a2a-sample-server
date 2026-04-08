import { LlmClient } from "../client.js";
import type { ChatMessage } from "../types.js";

describe("LlmClient", () => {
  const client = new LlmClient({ model: "mock" });

  describe("chat()", () => {
    it("should return a ChatCompletionResponse with the expected fields", async () => {
      const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];
      const response = await client.chat(messages);

      expect(response).toHaveProperty("id");
      expect(response).toHaveProperty("object");
      expect(response).toHaveProperty("model");
      expect(response).toHaveProperty("choices");
      expect(response).toHaveProperty("usage");
    });

    it("should return choices[0].message.content as a non-empty string", async () => {
      const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];
      const response = await client.chat(messages);

      expect(response.choices.length).toBeGreaterThan(0);
      expect(typeof response.choices[0].message.content).toBe("string");
      expect(response.choices[0].message.content.length).toBeGreaterThan(0);
    });

    it("should return choices[0].finish_reason as 'stop'", async () => {
      const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];
      const response = await client.chat(messages);

      expect(response.choices[0].finish_reason).toBe("stop");
    });

    it("should return space-related content when system prompt mentions Solar System Explorer", async () => {
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: "You are the Solar System Explorer, an enthusiastic guide to space!",
        },
        { role: "user", content: "Tell me about Mars" },
      ];
      const response = await client.chat(messages);
      const content = response.choices[0].message.content;

      // MockProvider matches keyword "Solar System Explorer" and returns space-themed responses
      expect(content.length).toBeGreaterThan(0);
      // The mock responses for "Solar System Explorer" contain planet/space-related terms
      expect(content).toMatch(
        /Mars|Jupiter|Saturn|Perseid|meteor|planet|solar|space|astronomy|storm|weather/i,
      );
    });
  });

  describe("chatStream()", () => {
    it("should yield chunks with delta.content strings", async () => {
      const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];
      const chunks = [];

      for await (const chunk of client.chatStream(messages)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(1);

      // All chunks except the last should have delta.content as a string
      for (const chunk of chunks.slice(0, -1)) {
        expect(typeof chunk.choices[0].delta.content).toBe("string");
      }
    }, 30_000);

    it("should have a final chunk with finish_reason 'stop'", async () => {
      const messages: ChatMessage[] = [{ role: "user", content: "Hello" }];
      const chunks = [];

      for await (const chunk of client.chatStream(messages)) {
        chunks.push(chunk);
      }

      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk.choices[0].finish_reason).toBe("stop");
    }, 30_000);
  });
});
