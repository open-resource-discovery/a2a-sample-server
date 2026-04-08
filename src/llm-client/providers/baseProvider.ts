import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  LlmConfig,
} from "../types.js";

export abstract class BaseLlmProvider {
  protected config: LlmConfig;

  public constructor(config: LlmConfig) {
    this.config = config;
  }

  public abstract chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;

  public async *chatCompletionStream(
    _request: ChatCompletionRequest,
  ): AsyncGenerator<ChatCompletionChunk> {
    yield* [];
    throw new Error("Streaming not supported by this provider");
  }

  protected mergeRequestDefaults(request: ChatCompletionRequest): ChatCompletionRequest {
    return {
      ...request,
      temperature: request.temperature ?? this.config.temperature,
    };
  }
}
