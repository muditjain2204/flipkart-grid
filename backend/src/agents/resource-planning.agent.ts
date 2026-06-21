import { Event } from '@prisma/client';
import { Agent, ResourcePlanningOutput, CongestionPredictionOutput } from './index';
import { HistoricalContext } from '../services/historical-data.service';
import { logger } from '../config/logger';
import { generateJSON } from '../services/llm.service';

interface ResourceInput {
  congestion: CongestionPredictionOutput;
  event: Event;
  historicalContext?: HistoricalContext;
}

export class ResourcePlanningAgent implements Agent<ResourceInput, ResourcePlanningOutput> {
  name = 'Resource Planning Agent';

  async execute(input: ResourceInput): Promise<ResourcePlanningOutput> {
    const { congestion, event, historicalContext } = input;
    logger.info(`[${this.name}] Planning resources via LLM...`);

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
      const result = await generateJSON<ResourcePlanningOutput>(systemPrompt, userPrompt);
      return result;
    } catch (e) {
      logger.error(`[${this.name}] LLM failed, falling back`, e);
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
