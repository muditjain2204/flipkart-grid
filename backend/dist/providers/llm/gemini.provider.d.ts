import { ZodSchema } from 'zod';
import { LLMProvider, LLMOptions } from './llm.provider';
/**
 * Google Gemini LLM Provider.
 *
 * Uses the @google/generative-ai SDK.
 * Default model: gemini-2.0-flash (fast, free tier friendly).
 * Supports JSON mode for structured output.
 */
export declare class GeminiProvider implements LLMProvider {
    readonly name = "Gemini";
    private client;
    private modelName;
    constructor(modelName?: string);
    generateText(prompt: string, options?: LLMOptions): Promise<string>;
    generateJSON<T>(prompt: string, schema: ZodSchema<T>, options?: LLMOptions): Promise<T>;
}
//# sourceMappingURL=gemini.provider.d.ts.map