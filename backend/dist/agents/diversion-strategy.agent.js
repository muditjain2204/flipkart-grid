"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiversionStrategyAgent = void 0;
const logger_1 = require("../config/logger");
const llm_service_1 = require("../services/llm.service");
class DiversionStrategyAgent {
    name = 'Diversion Strategy Agent';
    async execute(input) {
        const { congestion, event } = input;
        logger_1.logger.info(`[${this.name}] Generating diversions via LLM...`);
        const systemPrompt = `You are the Diversion Strategy Agent for SmartFlow AI.
Output a JSON object containing EXACTLY these keys:
{
  "diversionRoutes": [
    { "from": "start location", "to": "end location", "via": "route description", "estimatedTime": "X mins" }
  ],
  "restrictedZones": ["List", "of", "zones"],
  "advisoryMessages": ["List", "of", "public", "messages"],
  "reasoning": "Explanation"
}`;
        const userPrompt = `
Event: ${event.name} at ${event.venue}
Congestion Severity: ${congestion.congestionSeverity}
Impacted Corridors: ${congestion.impactedCorridors.join(', ')}
`;
        try {
            const result = await (0, llm_service_1.generateJSON)(systemPrompt, userPrompt);
            return result;
        }
        catch (e) {
            logger_1.logger.error(`[${this.name}] LLM failed, falling back`, e);
            return {
                diversionRoutes: [{ from: "Main Rd", to: "Highway", via: "Side St", estimatedTime: "15 mins" }],
                restrictedZones: [event.venue],
                advisoryMessages: ["Avoid area"],
                reasoning: "Fallback reasoning"
            };
        }
    }
}
exports.DiversionStrategyAgent = DiversionStrategyAgent;
//# sourceMappingURL=diversion-strategy.agent.js.map