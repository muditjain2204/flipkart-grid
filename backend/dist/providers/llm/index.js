"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLM_DEFAULTS = void 0;
exports.getLLMProvider = getLLMProvider;
const gemini_provider_1 = require("./gemini.provider");
const openai_provider_1 = require("./openai.provider");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
let _provider = null;
/**
 * Create or return the configured LLM provider singleton.
 *
 * Provider is determined by LLM_PROVIDER env var.
 * Falls back to the other provider if the primary fails to initialize.
 */
function getLLMProvider() {
    if (_provider)
        return _provider;
    try {
        if (env_1.env.LLM_PROVIDER === 'gemini') {
            _provider = new gemini_provider_1.GeminiProvider();
            logger_1.logger.info('✅ LLM Provider: Google Gemini');
        }
        else {
            _provider = new openai_provider_1.OpenAIProvider();
            logger_1.logger.info('✅ LLM Provider: OpenAI GPT');
        }
    }
    catch (primaryError) {
        logger_1.logger.warn(`Primary LLM (${env_1.env.LLM_PROVIDER}) failed to init, trying fallback...`);
        try {
            if (env_1.env.LLM_PROVIDER === 'gemini') {
                _provider = new openai_provider_1.OpenAIProvider();
                logger_1.logger.info('✅ LLM Provider (fallback): OpenAI GPT');
            }
            else {
                _provider = new gemini_provider_1.GeminiProvider();
                logger_1.logger.info('✅ LLM Provider (fallback): Google Gemini');
            }
        }
        catch (fallbackError) {
            logger_1.logger.error('❌ Both LLM providers failed to initialize. LLM features will be unavailable.');
            // Return a no-op provider that returns empty strings
            _provider = {
                name: 'NoOp',
                async generateText() { return ''; },
                async generateJSON(_p, schema) { return schema.parse({}); },
            };
        }
    }
    return _provider;
}
var llm_provider_1 = require("./llm.provider");
Object.defineProperty(exports, "LLM_DEFAULTS", { enumerable: true, get: function () { return llm_provider_1.LLM_DEFAULTS; } });
//# sourceMappingURL=index.js.map