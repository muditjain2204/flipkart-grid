"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLM_DEFAULTS = void 0;
/**
 * Default options for different use cases.
 */
exports.LLM_DEFAULTS = {
    FACTUAL: { temperature: 0.3, maxTokens: 4096 },
    CREATIVE: { temperature: 0.7, maxTokens: 4096 },
    STRUCTURED: { temperature: 0.1, maxTokens: 8192 },
};
//# sourceMappingURL=llm.provider.js.map