import OpenAI from 'openai';
import { ZodSchema } from 'zod';
import { LLMProvider, LLMOptions, LLM_DEFAULTS } from './llm.provider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

/**
 * OpenAI GPT LLM Provider.
 *
 * Uses the official openai SDK.
 * Default model: gpt-4o-mini (cost-effective, fast).
 * Supports JSON mode for structured output.
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = 'OpenAI';
  private client: OpenAI;
  private modelName: string;

  constructor(modelName: string = 'gpt-4o-mini') {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for OpenAI provider');
    }
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    this.modelName = modelName;
  }

  async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    const opts = { ...LLM_DEFAULTS.FACTUAL, ...options };

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (opts.systemPrompt) {
        messages.push({ role: 'system', content: opts.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
      });

      const text = response.choices[0]?.message?.content || '';
      logger.debug(`[OpenAI] Generated ${text.length} chars`);
      return text;
    } catch (error) {
      logger.error('[OpenAI] Generation failed:', error);
      throw error;
    }
  }

  async generateJSON<T>(prompt: string, schema: ZodSchema<T>, options?: LLMOptions): Promise<T> {
    const opts = { ...LLM_DEFAULTS.STRUCTURED, ...options };

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (opts.systemPrompt) {
        messages.push({ role: 'system', content: opts.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        response_format: { type: 'json_object' },
      });

      const text = response.choices[0]?.message?.content || '{}';

      try {
        const parsed = JSON.parse(text);
        return schema.parse(parsed);
      } catch (parseError) {
        logger.error('[OpenAI] JSON parsing/validation failed:', { raw: text.slice(0, 200) });
        throw new Error(`Failed to parse OpenAI JSON response: ${parseError}`);
      }
    } catch (error) {
      logger.error('[OpenAI] JSON generation failed:', error);
      throw error;
    }
  }
}
