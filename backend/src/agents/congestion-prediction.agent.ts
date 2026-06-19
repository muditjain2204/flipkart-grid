import { Agent, EventIntelligenceOutput, TrafficPerceptionOutput, CongestionPredictionOutput } from './index';
import { SEVERITY_MATRIX, CONGESTION_BUFFER_MINUTES } from '../utils/heuristics';
import { HistoricalContext, CorridorStats } from '../services/historical-data.service';
import { logger } from '../config/logger';

interface CongestionInput {
  eventIntelligence: EventIntelligenceOutput;
  trafficPerception: TrafficPerceptionOutput;
  venue: string;
  historicalContext?: HistoricalContext;
}

/**
 * Agent 3: Congestion Prediction Agent
 *
 * Fuses event intelligence and traffic perception data to forecast:
 * - Congestion severity level
 * - Peak congestion window
 * - Impacted road corridors
 * - Confidence score with reasoning
 *
 * When historical data is available, uses real corridor names and
 * incident patterns from the Astram dataset instead of generic heuristics.
 */
export class CongestionPredictionAgent implements Agent<CongestionInput, CongestionPredictionOutput> {
  name = 'Congestion Prediction Agent';

  async execute(input: CongestionInput): Promise<CongestionPredictionOutput> {
    const { eventIntelligence, trafficPerception, venue, historicalContext } = input;

    logger.info(`[${this.name}] Predicting congestion for risk=${eventIntelligence.eventRiskLevel}, density=${trafficPerception.densityLevel}`);

    // Determine congestion severity from the matrix
    const matrixKey = `${eventIntelligence.eventRiskLevel}_${trafficPerception.densityLevel}`;
    const congestionSeverity = SEVERITY_MATRIX[matrixKey] || 'MODERATE';

    // Calculate peak window
    const now = new Date();
    const peakStartTime = new Date(
      Math.max(eventIntelligence.arrivalWindowStart.getTime(), now.getTime())
    );

    const bufferMinutes = CONGESTION_BUFFER_MINUTES[congestionSeverity] || 30;
    const peakEndTime = new Date(
      eventIntelligence.departureWindowEnd.getTime() + bufferMinutes * 60 * 1000
    );

    // Identify impacted corridors — use historical data if available
    const impactedCorridors = historicalContext
      ? this.identifyCorridorsFromHistory(historicalContext, congestionSeverity, venue)
      : this.identifyCorridorsFallback(venue, congestionSeverity);

    // Calculate confidence score — boosted by historical data
    const predictionConfidence = this.calculateConfidence(
      eventIntelligence,
      trafficPerception,
      historicalContext
    );

    // Generate reasoning
    const reasoning = this.generateReasoning(
      eventIntelligence,
      trafficPerception,
      congestionSeverity,
      predictionConfidence
    );

    // Generate historical insight
    const historicalInsight = historicalContext
      ? this.generateHistoricalInsight(historicalContext, congestionSeverity)
      : undefined;

    logger.info(
      `[${this.name}] Prediction: severity=${congestionSeverity}, ` +
      `confidence=${predictionConfidence.toFixed(2)}, ` +
      `corridors=${impactedCorridors.length}`
    );

    return {
      congestionSeverity,
      peakStartTime,
      peakEndTime,
      impactedCorridors,
      predictionConfidence,
      reasoning,
      historicalInsight,
    };
  }

  /**
   * Identify impacted corridors from real historical incident data.
   * Uses corridors found near the event venue, ranked by incident count.
   */
  private identifyCorridorsFromHistory(
    context: HistoricalContext,
    severity: string,
    venue: string
  ): string[] {
    const corridors: string[] = [];

    // Sort corridor stats by incident count (highest risk first)
    const sortedCorridors = [...context.corridorStats]
      .sort((a, b) => b.totalIncidents - a.totalIncidents);

    // For severe/gridlock, include more corridors
    const maxCorridors = severity === 'GRIDLOCK' ? 6 : severity === 'SEVERE' ? 4 : 3;

    for (const cs of sortedCorridors.slice(0, maxCorridors)) {
      if (cs.corridor && cs.corridor !== 'Non-corridor') {
        corridors.push(cs.corridor);
      }
    }

    // Also add corridors from nearby incidents if not already included
    if (corridors.length < 2) {
      for (const c of context.nearbyIncidents.corridors) {
        if (c !== 'Non-corridor' && !corridors.includes(c)) {
          corridors.push(c);
          if (corridors.length >= maxCorridors) break;
        }
      }
    }

    // If historical data doesn't give us corridors, fall back
    if (corridors.length === 0) {
      return this.identifyCorridorsFallback(venue, severity);
    }

    // Add hotspot junctions as supplementary info
    if (severity === 'GRIDLOCK' || severity === 'SEVERE') {
      for (const hs of context.hotspots.slice(0, 3)) {
        const label = `${hs.junction} junction (${hs.totalIncidents} past incidents)`;
        corridors.push(label);
      }
    }

    return corridors;
  }

  /**
   * Fallback corridor identification when no historical data is available.
   * Uses venue name to generate reasonable corridor names.
   */
  private identifyCorridorsFallback(venue: string, severity: string): string[] {
    const baseCorridor = `Main approach road to ${venue}`;
    const corridors: string[] = [baseCorridor];

    if (severity === 'GRIDLOCK' || severity === 'SEVERE') {
      corridors.push(
        `Highway/arterial road nearest to ${venue}`,
        `Secondary roads within 2km of ${venue}`,
        `Parking zone access roads near ${venue}`
      );
    } else if (severity === 'MODERATE') {
      corridors.push(
        `Primary access road to ${venue}`,
        `Nearest intersection/junction to ${venue}`
      );
    }

    return corridors;
  }

  /**
   * Calculate prediction confidence based on data availability and event type uncertainty.
   * Historical data availability significantly boosts confidence.
   */
  private calculateConfidence(
    eventIntelligence: EventIntelligenceOutput,
    trafficPerception: TrafficPerceptionOutput,
    historicalContext?: HistoricalContext
  ): number {
    let confidence = 0.7; // Base confidence

    // Real-time traffic data available
    if (trafficPerception.framesProcessed > 0) {
      confidence += 0.1;
    }

    // Sufficient traffic data (many frames processed)
    if (trafficPerception.framesProcessed > 50) {
      confidence += 0.05;
    }

    // Historical data boosts confidence significantly
    if (historicalContext) {
      const nearby = historicalContext.nearbyIncidents;
      if (nearby.totalIncidents > 50) {
        confidence += 0.1; // Rich historical data
      } else if (nearby.totalIncidents > 10) {
        confidence += 0.05;
      }

      // Corridor-level data adds further confidence
      if (historicalContext.corridorStats.length > 0) {
        confidence += 0.05;
      }
    }

    // High-uncertainty event types reduce confidence
    if (
      eventIntelligence.eventRiskLevel === 'CRITICAL' &&
      (eventIntelligence.reasoning.includes('rally') || eventIntelligence.reasoning.includes('protest'))
    ) {
      confidence -= 0.2;
    }

    // Clamp between 0.3 and 0.95
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  /**
   * Generate historical insight string for the prediction.
   */
  private generateHistoricalInsight(context: HistoricalContext, severity: string): string {
    const parts: string[] = [];
    const nearby = context.nearbyIncidents;

    if (nearby.totalIncidents > 0) {
      parts.push(
        `Historical data: ${nearby.totalIncidents} past incidents recorded in this area.`
      );

      if (nearby.avgResolutionMinutes) {
        parts.push(
          `Average incident resolution: ${nearby.avgResolutionMinutes} min.`
        );
      }

      // Corridor-specific insights
      for (const cs of context.corridorStats.slice(0, 2)) {
        const topCause = cs.topCauses[0];
        parts.push(
          `${cs.corridor}: ${cs.totalIncidents} incidents` +
          (topCause ? `, primarily ${topCause.cause.toLowerCase().replace(/_/g, ' ')}` : '') +
          (cs.roadClosurePercentage > 10 ? `, ${cs.roadClosurePercentage}% required road closure` : '') +
          '.'
        );
      }
    }

    if (context.hotspots.length > 0) {
      parts.push(
        `High-risk junctions nearby: ${context.hotspots.slice(0, 3).map(h => `${h.junction} (${h.totalIncidents} incidents)`).join(', ')}.`
      );
    }

    return parts.join(' ');
  }

  private generateReasoning(
    eventIntel: EventIntelligenceOutput,
    traffic: TrafficPerceptionOutput,
    severity: string,
    confidence: number
  ): string {
    const parts: string[] = [];

    parts.push(
      `Based on event risk level ${eventIntel.eventRiskLevel} ` +
      `and current traffic density ${traffic.densityLevel}, ` +
      `predicted congestion severity is ${severity}.`
    );

    const totalVehicles = traffic.cars + traffic.bikes + traffic.buses + traffic.trucks;
    parts.push(
      `Current traffic: ${totalVehicles} vehicles detected ` +
      `(${traffic.cars} cars, ${traffic.bikes} bikes, ${traffic.buses} buses, ${traffic.trucks} trucks). ` +
      `Average speed: ${traffic.averageSpeedKmh} km/h. Queue length: ${traffic.queueLengthMeters}m.`
    );

    if (traffic.averageSpeedKmh < 10) {
      parts.push('Current traffic is near-stationary, indicating pre-existing congestion that will compound with event traffic.');
    }

    parts.push(`Prediction confidence: ${(confidence * 100).toFixed(0)}%.`);

    if (confidence < 0.6) {
      parts.push('Note: Lower confidence due to high event-type uncertainty or limited real-time data.');
    }

    return parts.join(' ');
  }
}
