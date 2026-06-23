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
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
}
/**
 * Default options for different use cases.
 */
export declare const LLM_DEFAULTS: {
    FACTUAL: LLMOptions;
    CREATIVE: LLMOptions;
    STRUCTURED: LLMOptions;
};
//# sourceMappingURL=llm.provider.d.ts.map