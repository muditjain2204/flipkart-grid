import { LLMProvider } from './llm.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

let _provider: LLMProvider | null = null;

/**
 * Create or return the configured LLM provider singleton.
 *
 * Provider is determined by LLM_PROVIDER env var.
 * Falls back to the other provider if the primary fails to initialize.
 */
export function getLLMProvider(): LLMProvider {
  if (_provider) return _provider;

  try {
    if (env.LLM_PROVIDER === 'gemini') {
      _provider = new GeminiProvider();
      logger.info('✅ LLM Provider: Google Gemini');
    } else {
      _provider = new OpenAIProvider();
      logger.info('✅ LLM Provider: OpenAI GPT');
    }
  } catch (primaryError) {
    logger.warn(`Primary LLM (${env.LLM_PROVIDER}) failed to init, trying fallback...`);

    try {
      if (env.LLM_PROVIDER === 'gemini') {
        _provider = new OpenAIProvider();
        logger.info('✅ LLM Provider (fallback): OpenAI GPT');
      } else {
        _provider = new GeminiProvider();
        logger.info('✅ LLM Provider (fallback): Google Gemini');
      }
    } catch (fallbackError) {
      logger.error('❌ Both LLM providers failed to initialize. LLM features will be unavailable.');
      // Return a no-op provider that returns empty strings
      _provider = {
        name: 'NoOp',
        async generateText() { return ''; },
        async generateJSON(_p: string, schema: any) { return schema.parse({}); },
      };
    }
  }

  return _provider;
}

export { LLMProvider, LLMOptions, LLM_DEFAULTS } from './llm.provider';
