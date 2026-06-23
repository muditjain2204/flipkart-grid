"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
const llm_provider_1 = require("./llm.provider");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
/**
 * Google Gemini LLM Provider.
 *
 * Uses the @google/generative-ai SDK.
 * Default model: gemini-2.0-flash (fast, free tier friendly).
 * Supports JSON mode for structured output.
 */
class GeminiProvider {
    name = 'Gemini';
    client;
    modelName;
    constructor(modelName = 'gemini-2.0-flash') {
        if (!env_1.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is required for Gemini provider');
        }
        this.client = new generative_ai_1.GoogleGenerativeAI(env_1.env.GEMINI_API_KEY);
        this.modelName = modelName;
    }
    async generateText(prompt, options) {
        const opts = { ...llm_provider_1.LLM_DEFAULTS.FACTUAL, ...options };
        try {
            const model = this.client.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    temperature: opts.temperature,
                    maxOutputTokens: opts.maxTokens,
                },
                ...(opts.systemPrompt && {
                    systemInstruction: opts.systemPrompt,
                }),
            });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            logger_1.logger.debug(`[Gemini] Generated ${text.length} chars`);
            return text;
        }
        catch (error) {
            logger_1.logger.error('[Gemini] Generation failed:', error);
            throw error;
        }
    }
    async generateJSON(prompt, schema, options) {
        const opts = { ...llm_provider_1.LLM_DEFAULTS.STRUCTURED, ...options };
        const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown code blocks, no explanations, no extra text. Just the JSON object.`;
        const text = await this.generateText(jsonPrompt, opts);
        // Extract JSON from response (handle possible markdown wrapping)
        let jsonStr = text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.slice(7);
        }
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.slice(3);
        }
        if (jsonStr.endsWith('```')) {
            jsonStr = jsonStr.slice(0, -3);
        }
        jsonStr = jsonStr.trim();
        try {
            const parsed = JSON.parse(jsonStr);
            return schema.parse(parsed);
        }
        catch (parseError) {
            logger_1.logger.error('[Gemini] JSON parsing/validation failed:', { raw: jsonStr.slice(0, 200) });
            throw new Error(`Failed to parse Gemini JSON response: ${parseError}`);
        }
    }
}
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=gemini.provider.js.map