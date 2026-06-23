"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
const llm_provider_1 = require("./llm.provider");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
/**
 * OpenAI GPT LLM Provider.
 *
 * Uses the official openai SDK.
 * Default model: gpt-4o-mini (cost-effective, fast).
 * Supports JSON mode for structured output.
 */
class OpenAIProvider {
    name = 'OpenAI';
    client;
    modelName;
    constructor(modelName = 'gpt-4o-mini') {
        if (!env_1.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is required for OpenAI provider');
        }
        this.client = new openai_1.default({ apiKey: env_1.env.OPENAI_API_KEY });
        this.modelName = modelName;
    }
    async generateText(prompt, options) {
        const opts = { ...llm_provider_1.LLM_DEFAULTS.FACTUAL, ...options };
        try {
            const messages = [];
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
            logger_1.logger.debug(`[OpenAI] Generated ${text.length} chars`);
            return text;
        }
        catch (error) {
            logger_1.logger.error('[OpenAI] Generation failed:', error);
            throw error;
        }
    }
    async generateJSON(prompt, schema, options) {
        const opts = { ...llm_provider_1.LLM_DEFAULTS.STRUCTURED, ...options };
        try {
            const messages = [];
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
            }
            catch (parseError) {
                logger_1.logger.error('[OpenAI] JSON parsing/validation failed:', { raw: text.slice(0, 200) });
                throw new Error(`Failed to parse OpenAI JSON response: ${parseError}`);
            }
        }
        catch (error) {
            logger_1.logger.error('[OpenAI] JSON generation failed:', error);
            throw error;
        }
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openai.provider.js.map