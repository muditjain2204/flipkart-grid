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

interface SynthesisInput {
  event: Event;
  eventIntelligence: EventIntelligenceOutput;
  trafficPerception: TrafficPerceptionOutput;
  congestionPrediction: CongestionPredictionOutput;
  resourcePlanning: ResourcePlanningOutput;
  diversionStrategy: DiversionStrategyOutput;
}

/**
 * Agent 6: Decision Synthesis Agent
 *
 * Aggregates outputs from all 5 preceding agents into a final actionable report.
 * In Phase 4, this will be enhanced with LLM-powered reasoning (Gemini/OpenAI).
 *
 * Currently uses rule-based synthesis with structured report generation.
 */
export class DecisionSynthesisAgent implements Agent<SynthesisInput, DecisionSynthesisOutput> {
  name = 'Decision Synthesis Agent';

  async execute(input: SynthesisInput): Promise<DecisionSynthesisOutput> {
    const {
      event,
      eventIntelligence,
      trafficPerception,
      congestionPrediction,
      resourcePlanning,
      diversionStrategy,
    } = input;

    logger.info(`[${this.name}] Synthesizing final report for "${event.name}"`);

    // 1. Event Summary
    const eventSummary = {
      name: event.name,
      venue: event.venue,
      type: event.eventType,
      expectedCrowd: event.expectedCrowd,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      riskLevel: eventIntelligence.eventRiskLevel,
      riskScore: eventIntelligence.riskScore,
    };

    // 2. Current Traffic Situation
    const currentTraffic = {
      totalVehicles: trafficPerception.cars + trafficPerception.bikes + trafficPerception.buses + trafficPerception.trucks,
      breakdown: {
        cars: trafficPerception.cars,
        bikes: trafficPerception.bikes,
        buses: trafficPerception.buses,
        trucks: trafficPerception.trucks,
      },
      densityLevel: trafficPerception.densityLevel,
      queueLength: `${trafficPerception.queueLengthMeters}m`,
      averageSpeed: `${trafficPerception.averageSpeedKmh} km/h`,
      status: trafficPerception.averageSpeedKmh < 10 ? 'CONGESTED' :
              trafficPerception.averageSpeedKmh < 25 ? 'SLOW MOVING' : 'FLOWING',
    };

    // 3. Predicted Congestion
    const predictedCongestion = {
      severity: congestionPrediction.congestionSeverity,
      peakWindow: {
        start: congestionPrediction.peakStartTime.toISOString(),
        end: congestionPrediction.peakEndTime.toISOString(),
        durationMinutes: Math.round(
          (congestionPrediction.peakEndTime.getTime() - congestionPrediction.peakStartTime.getTime()) / 60000
        ),
      },
      impactedCorridors: congestionPrediction.impactedCorridors,
    };

    // 4. High-Risk Locations
    const highRiskLocations = [
      ...congestionPrediction.impactedCorridors,
      ...resourcePlanning.deploymentZones.slice(0, 3),
    ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate

    // 5. Officer Deployment
    const officerDeployment = {
      totalOfficers: resourcePlanning.officersRequired,
      totalBarricades: resourcePlanning.barricadesRequired,
      deploymentZones: resourcePlanning.deploymentZones,
      patrolPriority: resourcePlanning.patrolPriority,
    };

    // 6. Barricade Strategy
    const barricadeStrategy = {
      total: resourcePlanning.barricadesRequired,
      placement: congestionPrediction.impactedCorridors.map((corridor, i) => ({
        corridor,
        barricades: 3,
        purpose: i === 0 ? 'Primary traffic control' : 'Secondary flow management',
      })),
      emergencyCorridor: 'Maintained — minimum 1 lane kept clear at all times',
    };

    // 7. Diversions
    const diversions = {
      routes: diversionStrategy.diversionRoutes,
      restrictedZones: diversionStrategy.restrictedZones,
      advisories: diversionStrategy.advisoryMessages,
    };

    // 8. Public Advisory (compiled from diversion agent)
    const publicAdvisory = diversionStrategy.advisoryMessages;

    // 9. Confidence Score (weighted average)
    const confidenceScore = this.calculateFinalConfidence(
      congestionPrediction.predictionConfidence,
      trafficPerception,
      eventIntelligence
    );

    // 10. Explanation
    const explanation = this.synthesizeExplanation(input, confidenceScore);

    logger.info(
      `[${this.name}] Report complete. Confidence: ${(confidenceScore * 100).toFixed(0)}%`
    );

    return {
      eventSummary,
      currentTraffic,
      predictedCongestion,
      highRiskLocations,
      officerDeployment,
      barricadeStrategy,
      diversions,
      publicAdvisory,
      confidenceScore,
      explanation,
    };
  }

  private calculateFinalConfidence(
    predictionConfidence: number,
    traffic: TrafficPerceptionOutput,
    eventIntel: EventIntelligenceOutput
  ): number {
    // Weighted average of data quality indicators
    let score = predictionConfidence * 0.6; // Prediction is primary

    // Real CV data increases confidence
    if (traffic.framesProcessed > 0) {
      score += 0.15;
    } else {
      score += 0.05; // Mock data, lower confidence
    }

    // Event data quality
    score += 0.15; // Event data is always provided

    // Reduce for highly uncertain event types
    if (eventIntel.eventRiskLevel === 'CRITICAL') {
      score += 0.05; // More data points for critical events
    }

    return Math.max(0.3, Math.min(0.95, score));
  }

  private synthesizeExplanation(input: SynthesisInput, confidence: number): string {
    const { event, eventIntelligence, trafficPerception, congestionPrediction, resourcePlanning, diversionStrategy } = input;

    const sections: string[] = [];

    // Overall assessment
    sections.push(
      `## Overall Assessment\n` +
      `"${event.name}" at ${event.venue} is rated ${eventIntelligence.eventRiskLevel} risk ` +
      `with expected ${congestionPrediction.congestionSeverity} congestion. ` +
      `Confidence in this prediction: ${(confidence * 100).toFixed(0)}%.`
    );

    // Key risks
    sections.push(
      `\n## Key Risks\n` +
      `- ${event.expectedCrowd.toLocaleString()} expected attendees at a single venue\n` +
      `- ${congestionPrediction.impactedCorridors.length} road corridors will be affected\n` +
      `- Current traffic already at ${trafficPerception.densityLevel} density ` +
      `(avg speed: ${trafficPerception.averageSpeedKmh} km/h)`
    );

    // Action items
    sections.push(
      `\n## Priority Actions\n` +
      `1. Deploy ${resourcePlanning.officersRequired} officers across ${resourcePlanning.deploymentZones.length} zones\n` +
      `2. Install ${resourcePlanning.barricadesRequired} barricades at impacted corridors\n` +
      `3. Activate ${diversionStrategy.diversionRoutes.length} diversion routes\n` +
      `4. Enforce ${diversionStrategy.restrictedZones.length} restricted zones\n` +
      `5. Broadcast ${diversionStrategy.advisoryMessages.length} public advisories`
    );

    // Assumptions
    sections.push(
      `\n## Assumptions\n` +
      `- Crowd estimate of ${event.expectedCrowd.toLocaleString()} is accurate ±20%\n` +
      `- Weather conditions are normal (no rain/storm adjustments)\n` +
      `- ${trafficPerception.framesProcessed > 0 ? 'Real-time' : 'Simulated'} traffic data used for analysis\n` +
      `- No concurrent major events in the same area`
    );

    return sections.join('\n');
  }
}
