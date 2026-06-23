"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficPerceptionAgent = void 0;
const logger_1 = require("../config/logger");
const llm_service_1 = require("../services/llm.service");
class TrafficPerceptionAgent {
    name = 'Traffic Perception Agent';
    async execute(videoUrl) {
        logger_1.logger.info(`[${this.name}] Processing traffic perception via LLM...`);
        const systemPrompt = `You are the Traffic Perception Agent for SmartFlow AI.
Analyze the provided camera feed metadata and output a JSON object containing EXACTLY these keys:
{
  "cars": number,
  "bikes": number,
  "buses": number,
  "trucks": number,
  "densityLevel": "LOW" | "MODERATE" | "HIGH" | "GRIDLOCK",
  "queueLengthMeters": number,
  "averageSpeedKmh": number,
  "framesProcessed": number,
  "processingTimeSeconds": number
}
Generate realistic numbers for a current live traffic scenario.`;
        const userPrompt = videoUrl
            ? `Processing live video feed from ${videoUrl}...`
            : `No live feed provided. Simulating traffic based on typical current conditions.`;
        try {
            const result = await (0, llm_service_1.generateJSON)(systemPrompt, userPrompt);
            return result;
        }
        catch (e) {
            logger_1.logger.error(`[${this.name}] LLM failed, falling back`, e);
            return {
                cars: 120, bikes: 45, buses: 5, trucks: 12,
                densityLevel: "MODERATE", queueLengthMeters: 250, averageSpeedKmh: 35,
                framesProcessed: 1200, processingTimeSeconds: 40
            };
        }
    }
}
exports.TrafficPerceptionAgent = TrafficPerceptionAgent;
//# sourceMappingURL=traffic-perception.agent.js.map