import { ZodSchema } from 'zod';
import { LLMProvider, LLMOptions } from './llm.provider';
/**
 * OpenAI GPT LLM Provider.
 *
 * Uses the official openai SDK.
 * Default model: gpt-4o-mini (cost-effective, fast).
 * Supports JSON mode for structured output.
 */
export declare class OpenAIProvider implements LLMProvider {
    readonly name = "OpenAI";
    private client;
    private modelName;
    constructor(modelName?: string);
    generateText(prompt: string, options?: LLMOptions): Promise<string>;
    generateJSON<T>(prompt: string, schema: ZodSchema<T>, options?: LLMOptions): Promise<T>;
}
//# sourceMappingURL=openai.provider.d.ts.map