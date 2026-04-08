import { MockProvider } from "./providers/mockProvider.js";
import type {
  LlmConfig,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
} from "./types.js";

export class LlmClient {
  private readonly provider: MockProvider;

  public constructor(config: LlmConfig) {
    this.provider = new MockProvider(config);
  }

  public chat(
    messages: ChatMessage[],
    options?: Partial<ChatCompletionRequest>,
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      messages,
      ...options,
    };

    return this.provider.chatCompletion(request);
  }

  public async *chatStream(
    messages: ChatMessage[],
    options?: Partial<ChatCompletionRequest>,
  ): AsyncGenerator<ChatCompletionChunk> {
    const request: ChatCompletionRequest = { messages, ...options };
    yield* this.provider.chatCompletionStream(request);
  }
}
