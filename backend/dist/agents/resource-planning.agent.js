"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcePlanningAgent = void 0;
const logger_1 = require("../config/logger");
const llm_service_1 = require("../services/llm.service");
class ResourcePlanningAgent {
    name = 'Resource Planning Agent';
    async execute(input) {
        const { congestion, event, historicalContext } = input;
        logger_1.logger.info(`[${this.name}] Planning resources via LLM...`);
        const systemPrompt = `You are the Resource Planning Agent for SmartFlow AI.
Analyze the expected congestion and event size, then return a JSON object containing EXACTLY these keys:
{
  "officersRequired": number,
  "barricadesRequired": number,
  "deploymentZones": ["List", "of", "zone", "names"],
  "patrolPriority": [
    { "zone": "Zone Name", "priority": 1 }
  ],
  "reasoning": "Explanation of resource allocation"
}`;
        const userPrompt = `
Event: ${event.name} (Crowd: ${event.expectedCrowd})
Congestion Severity: ${congestion.congestionSeverity}
Impacted Corridors: ${congestion.impactedCorridors.join(', ')}

Historical Data:
${historicalContext ? `Incidents: ${historicalContext.nearbyIncidents.totalIncidents}` : "None"}
`;
        try {
            const result = await (0, llm_service_1.generateJSON)(systemPrompt, userPrompt);
            return result;
        }
        catch (e) {
            logger_1.logger.error(`[${this.name}] LLM failed, falling back`, e);
            return {
                officersRequired: 15,
                barricadesRequired: 50,
                deploymentZones: ["Zone A", "Zone B"],
                patrolPriority: [{ zone: "Zone A", priority: 1 }],
                reasoning: "Fallback reasoning"
            };
        }
    }
}
exports.ResourcePlanningAgent = ResourcePlanningAgent;
//# sourceMappingURL=resource-planning.agent.js.map