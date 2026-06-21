import { Event } from '@prisma/client';
import {
  Agent,
  EventIntelligenceOutput,
  TrafficPerceptionOutput,
  CongestionPredictionOutput,
  ResourcePlanningOutput,
  DiversionStrategyOutput,
  DecisionSynthesisOutput,
} from './index';
import { logger } from '../config/logger';
import { generateJSON } from '../services/llm.service';

interface SynthesisInput {
  event: Event;
  eventIntelligence: EventIntelligenceOutput;
  trafficPerception: TrafficPerceptionOutput;
  congestionPrediction: CongestionPredictionOutput;
  resourcePlanning: ResourcePlanningOutput;
  diversionStrategy: DiversionStrategyOutput;
}

export class DecisionSynthesisAgent implements Agent<SynthesisInput, DecisionSynthesisOutput> {
  name = 'Decision Synthesis Agent';

  async execute(input: SynthesisInput): Promise<DecisionSynthesisOutput> {
    logger.info(`[${this.name}] Synthesizing final report via LLM...`);

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
      const result = await generateJSON<DecisionSynthesisOutput>(systemPrompt, userPrompt);
      return result;
    } catch (e) {
      logger.error(`[${this.name}] LLM failed, falling back`, e);
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
