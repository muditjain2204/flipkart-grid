import { Event } from '@prisma/client';
import { Agent, DiversionStrategyOutput, CongestionPredictionOutput } from './index';
import { logger } from '../config/logger';
import { generateJSON } from '../services/llm.service';

interface DiversionInput {
  congestion: CongestionPredictionOutput;
  event: Event;
}

export class DiversionStrategyAgent implements Agent<DiversionInput, DiversionStrategyOutput> {
  name = 'Diversion Strategy Agent';

  async execute(input: DiversionInput): Promise<DiversionStrategyOutput> {
    const { congestion, event } = input;
    logger.info(`[${this.name}] Generating diversions via LLM...`);

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
      const result = await generateJSON<DiversionStrategyOutput>(systemPrompt, userPrompt);
      return result;
    } catch (e) {
      logger.error(`[${this.name}] LLM failed, falling back`, e);
      return {
        diversionRoutes: [{ from: "Main Rd", to: "Highway", via: "Side St", estimatedTime: "15 mins" }],
        restrictedZones: [event.venue],
        advisoryMessages: ["Avoid area"],
        reasoning: "Fallback reasoning"
      };
    }
  }
}
