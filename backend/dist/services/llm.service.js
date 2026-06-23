"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJSON = generateJSON;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const openai = new openai_1.default({
    apiKey: env_1.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});
async function generateJSON(systemPrompt, userPrompt) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
        });
        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error("LLM returned empty content");
        }
        return JSON.parse(content);
    }
    catch (error) {
        logger_1.logger.error("LLM Generation Error:", error);
        throw error;
    }
}
//# sourceMappingURL=llm.service.js.map