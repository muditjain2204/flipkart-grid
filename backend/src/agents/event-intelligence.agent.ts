import { Event } from '@prisma/client';
import { Agent, EventIntelligenceOutput } from './index';
import { HistoricalContext } from '../services/historical-data.service';
import { logger } from '../config/logger';
import { generateJSON } from '../services/llm.service';

export class EventIntelligenceAgent implements Agent<{ event: Event; historicalContext?: HistoricalContext }, EventIntelligenceOutput> {
  name = 'Event Intelligence Agent';

  async execute(input: { event: Event; historicalContext?: HistoricalContext }): Promise<EventIntelligenceOutput> {
    const { event, historicalContext } = input;
    logger.info(`[${this.name}] Analyzing event via LLM: ${event.name} (${event.eventType})`);

    const systemPrompt = `You are the Event Intelligence Agent for SmartFlow AI.
Analyze the event and output a JSON object containing EXACTLY these keys:
{
  "eventRiskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "riskScore": number (1-100),
  "arrivalWindowStart": "ISO8601 date string",
  "arrivalWindowEnd": "ISO8601 date string",
  "departureWindowStart": "ISO8601 date string",
  "departureWindowEnd": "ISO8601 date string",
  "reasoning": "A concise explanation of the risk assessment.",
  "historicalInsight": "A concise explanation of historical context if available."
}`;

    const userPrompt = `
Event Data:
Name: ${event.name}
Type: ${event.eventType}
Venue: ${event.venue}
Crowd: ${event.expectedCrowd}
Start: ${event.startTime.toISOString()}
End: ${event.endTime.toISOString()}

Historical Context:
${historicalContext ? JSON.stringify(historicalContext.nearbyIncidents) : "None available."}
`;

    try {
      const result = await generateJSON<any>(systemPrompt, userPrompt);
      return {
        ...result,
        arrivalWindowStart: new Date(result.arrivalWindowStart),
        arrivalWindowEnd: new Date(result.arrivalWindowEnd),
        departureWindowStart: new Date(result.departureWindowStart),
        departureWindowEnd: new Date(result.departureWindowEnd),
      };
    } catch (e) {
      logger.error(`[${this.name}] LLM failed, falling back to basic heuristic`, e);
      // Fallback
      return {
        eventRiskLevel: "MODERATE",
        riskScore: 50,
        arrivalWindowStart: new Date(event.startTime.getTime() - 3600000),
        arrivalWindowEnd: event.startTime,
        departureWindowStart: event.endTime,
        departureWindowEnd: new Date(event.endTime.getTime() + 3600000),
        reasoning: "Fallback reasoning due to LLM error.",
      };
    }
  }
}
