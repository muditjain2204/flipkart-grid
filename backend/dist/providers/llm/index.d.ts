import { LLMProvider } from './llm.provider';
/**
 * Create or return the configured LLM provider singleton.
 *
 * Provider is determined by LLM_PROVIDER env var.
 * Falls back to the other provider if the primary fails to initialize.
 */
export declare function getLLMProvider(): LLMProvider;
export { LLMProvider, LLMOptions, LLM_DEFAULTS } from './llm.provider';
//# sourceMappingURL=index.d.ts.map