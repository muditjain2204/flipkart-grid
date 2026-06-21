import { Agent, TrafficPerceptionOutput } from './index';
import { logger } from '../config/logger';
import { generateJSON } from '../services/llm.service';

export class TrafficPerceptionAgent implements Agent<string | undefined, TrafficPerceptionOutput> {
  name = 'Traffic Perception Agent';

  async execute(videoUrl?: string): Promise<TrafficPerceptionOutput> {
    logger.info(`[${this.name}] Processing traffic perception via LLM...`);

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
      const result = await generateJSON<TrafficPerceptionOutput>(systemPrompt, userPrompt);
      return result;
    } catch (e) {
      logger.error(`[${this.name}] LLM failed, falling back`, e);
      return {
        cars: 120, bikes: 45, buses: 5, trucks: 12,
        densityLevel: "MODERATE", queueLengthMeters: 250, averageSpeedKmh: 35,
        framesProcessed: 1200, processingTimeSeconds: 40
      };
    }
  }
}
