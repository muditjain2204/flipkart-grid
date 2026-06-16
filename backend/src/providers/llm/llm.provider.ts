import { ZodSchema } from 'zod';

/**
 * Abstract LLM Provider interface.
 * Implementations must support both raw text and structured JSON generation.
 */
export interface LLMProvider {
  /**
   * Generate raw text from a prompt.
   */
  generateText(prompt: string, options?: LLMOptions): Promise<string>;

  /**
   * Generate structured JSON validated against a Zod schema.
   * The prompt should instruct the model to output JSON.
   */
  generateJSON<T>(prompt: string, schema: ZodSchema<T>, options?: LLMOptions): Promise<T>;

  /**
   * Provider name for logging.
   */
  readonly name: string;
}

export interface LLMOptions {
  temperature?: number;    // 0.0-1.0, default 0.3 for factual
  maxTokens?: number;      // Max output tokens
  systemPrompt?: string;   // System instruction
}

/**
 * Default options for different use cases.
 */
export const LLM_DEFAULTS = {
  FACTUAL: { temperature: 0.3, maxTokens: 4096 } as LLMOptions,
  CREATIVE: { temperature: 0.7, maxTokens: 4096 } as LLMOptions,
  STRUCTURED: { temperature: 0.1, maxTokens: 8192 } as LLMOptions,
};
