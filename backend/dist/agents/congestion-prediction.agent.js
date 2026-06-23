"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CongestionPredictionAgent = void 0;
const logger_1 = require("../config/logger");
const llm_service_1 = require("../services/llm.service");
class CongestionPredictionAgent {
    name = 'Congestion Prediction Agent';
    async execute(input) {
        const { eventIntelligence, trafficPerception, venue, historicalContext } = input;
        logger_1.logger.info(`[${this.name}] Predicting congestion via LLM for venue ${venue}...`);
        const systemPrompt = `You are the Congestion Prediction Agent for SmartFlow AI.
Analyze the event intelligence, current traffic, and venue. Predict the future congestion and return a JSON object containing EXACTLY these keys:
{
  "congestionSeverity": "NONE" | "MILD" | "MODERATE" | "SEVERE" | "GRIDLOCK",
  "peakStartTime": "ISO8601 date string",
  "peakEndTime": "ISO8601 date string",
  "impactedCorridors": ["List", "of", "road", "names"],
  "predictionConfidence": number (0.0 to 1.0),
  "reasoning": "Concise reasoning for the prediction.",
  "historicalInsight": "Any insight from historical context"
}`;
        const userPrompt = `
Venue: ${venue}
Event Risk Level: ${eventIntelligence.eventRiskLevel}
Expected Arrival Window: ${eventIntelligence.arrivalWindowStart.toISOString()} to ${eventIntelligence.arrivalWindowEnd.toISOString()}

Current Traffic:
Total Vehicles: ${trafficPerception.cars + trafficPerception.bikes + trafficPerception.buses + trafficPerception.trucks}
Density: ${trafficPerception.densityLevel}
Avg Speed: ${trafficPerception.averageSpeedKmh} km/h

Historical Context:
${historicalContext ? JSON.stringify(historicalContext.hotspots) : "None"}
`;
        try {
            const result = await (0, llm_service_1.generateJSON)(systemPrompt, userPrompt);
            return {
                ...result,
                peakStartTime: new Date(result.peakStartTime),
                peakEndTime: new Date(result.peakEndTime),
            };
        }
        catch (e) {
            logger_1.logger.error(`[${this.name}] LLM failed, falling back`, e);
            return {
                congestionSeverity: "SEVERE",
                peakStartTime: eventIntelligence.arrivalWindowStart,
                peakEndTime: eventIntelligence.arrivalWindowEnd,
                impactedCorridors: [`Main Rd near ${venue}`, "Highway Exit 4"],
                predictionConfidence: 0.6,
                reasoning: "Fallback reasoning",
            };
        }
    }
}
exports.CongestionPredictionAgent = CongestionPredictionAgent;
//# sourceMappingURL=congestion-prediction.agent.js.map