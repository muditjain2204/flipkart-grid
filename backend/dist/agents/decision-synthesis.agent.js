"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionSynthesisAgent = void 0;
const logger_1 = require("../config/logger");
const llm_service_1 = require("../services/llm.service");
class DecisionSynthesisAgent {
    name = 'Decision Synthesis Agent';
    async execute(input) {
        logger_1.logger.info(`[${this.name}] Synthesizing final report via LLM...`);
        const systemPrompt = `You are the Decision Synthesis Agent, the final executive agent in the SmartFlow AI pipeline.
You must synthesize the inputs from the 5 previous agents into a cohesive final JSON report.
Return a JSON object containing EXACTLY these keys:
{
  "eventSummary": { "name": "string", "riskLevel": "string" },
  "currentTraffic": { "status": "string", "averageSpeed": "string" },
  "predictedCongestion": { "severity": "string", "peakWindow": "string" },
  "highRiskLocations": ["string"],
  "officerDeployment": { "totalOfficers": number, "zones": ["string"] },
  "barricadeStrategy": { "total": number, "locations": ["string"] },
  "diversions": { "routes": ["string"], "advisories": ["string"] },
  "publicAdvisory": ["string"],
  "confidenceScore": number (0.0 to 1.0),
  "explanation": "A comprehensive executive summary written in markdown format."
}`;
        const userPrompt = `
Inputs to synthesize:
Event: ${input.event.name}
Risk: ${input.eventIntelligence.eventRiskLevel}
Traffic: ${input.trafficPerception.densityLevel}
Congestion: ${input.congestionPrediction.congestionSeverity}
Officers: ${input.resourcePlanning.officersRequired}
Diversions: ${input.diversionStrategy.diversionRoutes.length}

Generate a unique executive synthesis.
`;
        try {
            const result = await (0, llm_service_1.generateJSON)(systemPrompt, userPrompt);
            return result;
        }
        catch (e) {
            logger_1.logger.error(`[${this.name}] LLM failed, falling back`, e);
            return {
                eventSummary: { name: input.event.name, riskLevel: input.eventIntelligence.eventRiskLevel },
                currentTraffic: { status: "MODERATE", averageSpeed: "35 km/h" },
                predictedCongestion: { severity: "MODERATE", peakWindow: "N/A" },
                highRiskLocations: ["Venue"],
                officerDeployment: { totalOfficers: 10, zones: ["Venue"] },
                barricadeStrategy: { total: 20, locations: ["Venue"] },
                diversions: { routes: ["Alt route"], advisories: ["Use alt route"] },
                publicAdvisory: ["Avoid area"],
                confidenceScore: 0.75,
                explanation: "Fallback synthesis due to LLM error."
            };
        }
    }
}
exports.DecisionSynthesisAgent = DecisionSynthesisAgent;
//# sourceMappingURL=decision-synthesis.agent.js.map