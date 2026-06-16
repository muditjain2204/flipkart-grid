import { Agent, EventIntelligenceOutput, TrafficPerceptionOutput, CongestionPredictionOutput } from './index';
import { SEVERITY_MATRIX, CONGESTION_BUFFER_MINUTES } from '../utils/heuristics';
import { logger } from '../config/logger';

interface CongestionInput {
  eventIntelligence: EventIntelligenceOutput;
  trafficPerception: TrafficPerceptionOutput;
  venue: string;
}

/**
 * Agent 3: Congestion Prediction Agent
 *
 * Fuses event intelligence and traffic perception data to forecast:
 * - Congestion severity level
 * - Peak congestion window
 * - Impacted road corridors
 * - Confidence score with reasoning
 */
export class CongestionPredictionAgent implements Agent<CongestionInput, CongestionPredictionOutput> {
  name = 'Congestion Prediction Agent';

  async execute(input: CongestionInput): Promise<CongestionPredictionOutput> {
    const { eventIntelligence, trafficPerception, venue } = input;

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

    // Identify impacted corridors (heuristic: venue-based)
    const impactedCorridors = this.identifyCorridors(venue, congestionSeverity);

    // Calculate confidence score
    const predictionConfidence = this.calculateConfidence(
      eventIntelligence,
      trafficPerception
    );

    // Generate reasoning
    const reasoning = this.generateReasoning(
      eventIntelligence,
      trafficPerception,
      congestionSeverity,
      predictionConfidence
    );

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
    };
  }

  /**
   * Identify likely impacted corridors based on venue name.
   * In production, this would use geospatial queries + Mapbox.
   * For the hackathon, we generate reasonable corridors from the venue.
   */
  private identifyCorridors(venue: string, severity: string): string[] {
    // Extract city/area keywords from venue
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
   */
  private calculateConfidence(
    eventIntelligence: EventIntelligenceOutput,
    trafficPerception: TrafficPerceptionOutput
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
