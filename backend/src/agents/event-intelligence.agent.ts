import { Event } from '@prisma/client';
import { Agent, EventIntelligenceOutput } from './index';
import { calculateRisk } from '../utils/risk-calculator';
import { ARRIVAL_WINDOW_OFFSETS, DEPARTURE_WINDOW_OFFSETS } from '../utils/heuristics';
import { HistoricalContext, NearbyIncidentSummary } from '../services/historical-data.service';
import { logger } from '../config/logger';

/**
 * Agent 1: Event Intelligence Agent
 *
 * Analyzes event metadata to determine:
 * - Event risk level and score
 * - Expected arrival window (when crowds will converge)
 * - Expected departure window (when crowds will disperse)
 *
 * Uses heuristic rules based on event type, crowd size, and timing.
 * When historical data is available, enriches reasoning with real
 * incident statistics from the Astram dataset.
 */
export class EventIntelligenceAgent implements Agent<{ event: Event; historicalContext?: HistoricalContext }, EventIntelligenceOutput> {
  name = 'Event Intelligence Agent';

  async execute(input: { event: Event; historicalContext?: HistoricalContext }): Promise<EventIntelligenceOutput> {
    const { event, historicalContext } = input;
    logger.info(`[${this.name}] Analyzing event: ${event.name} (${event.eventType})`);

    // Calculate risk level
    const { riskLevel, riskScore } = calculateRisk(
      event.expectedCrowd,
      event.eventType,
      event.startTime
    );

    // Adjust risk score based on historical incident density
    let adjustedRiskScore = riskScore;
    if (historicalContext && historicalContext.nearbyIncidents.totalIncidents > 0) {
      const incidentDensityFactor = this.getHistoricalRiskAdjustment(historicalContext.nearbyIncidents);
      adjustedRiskScore = Math.round(riskScore * incidentDensityFactor);
      logger.info(
        `[${this.name}] Risk adjusted by historical factor: ${incidentDensityFactor.toFixed(2)} ` +
        `(${historicalContext.nearbyIncidents.totalIncidents} nearby incidents)`
      );
    }

    // Calculate arrival window
    const arrivalOffsets = ARRIVAL_WINDOW_OFFSETS[event.eventType];
    const arrivalWindowStart = new Date(
      event.startTime.getTime() - arrivalOffsets.beforeHours * 60 * 60 * 1000
    );
    const arrivalWindowEnd = new Date(
      event.startTime.getTime() + arrivalOffsets.afterHours * 60 * 60 * 1000
    );

    // Calculate departure window
    const departureOffsets = DEPARTURE_WINDOW_OFFSETS[event.eventType];
    const departureWindowStart = new Date(
      event.endTime.getTime() + departureOffsets.afterEndHours * 60 * 60 * 1000
    );
    const departureWindowEnd = new Date(
      event.endTime.getTime() + departureOffsets.bufferHours * 60 * 60 * 1000
    );

    // Generate reasoning
    const reasoning = this.generateReasoning(event, riskLevel, adjustedRiskScore);

    // Generate historical insight
    const historicalInsight = historicalContext
      ? this.generateHistoricalInsight(historicalContext)
      : undefined;

    logger.info(
      `[${this.name}] Result: Risk=${riskLevel} (score=${adjustedRiskScore}), ` +
      `Arrival=${arrivalWindowStart.toISOString()} to ${arrivalWindowEnd.toISOString()}`
    );

    return {
      eventRiskLevel: riskLevel,
      riskScore: adjustedRiskScore,
      arrivalWindowStart,
      arrivalWindowEnd,
      departureWindowStart,
      departureWindowEnd,
      reasoning,
      historicalInsight,
    };
  }

  /**
   * Calculate a risk adjustment factor based on historical incident density.
   * More past incidents near the location = higher risk.
   */
  private getHistoricalRiskAdjustment(nearby: NearbyIncidentSummary): number {
    let factor = 1.0;

    // High incident areas get a risk boost
    if (nearby.totalIncidents > 50) {
      factor += 0.3;
    } else if (nearby.totalIncidents > 20) {
      factor += 0.15;
    } else if (nearby.totalIncidents > 5) {
      factor += 0.05;
    }

    // High priority percentage increases risk
    if (nearby.highPriorityPercentage > 70) {
      factor += 0.15;
    } else if (nearby.highPriorityPercentage > 50) {
      factor += 0.1;
    }

    return factor;
  }

  /**
   * Generate human-readable insight from historical data.
   */
  private generateHistoricalInsight(context: HistoricalContext): string {
    const parts: string[] = [];
    const nearby = context.nearbyIncidents;

    if (nearby.totalIncidents > 0) {
      parts.push(
        `Historical analysis: ${nearby.totalIncidents} traffic incidents recorded within 3km of this venue.`
      );

      if (nearby.topCauses.length > 0) {
        const causeStr = nearby.topCauses
          .slice(0, 3)
          .map((c) => `${c.cause.toLowerCase().replace(/_/g, ' ')} (${c.count})`)
          .join(', ');
        parts.push(`Most common causes: ${causeStr}.`);
      }

      if (nearby.avgResolutionMinutes) {
        parts.push(`Average incident resolution time in this area: ${nearby.avgResolutionMinutes} minutes.`);
      }

      if (nearby.corridors.length > 0) {
        parts.push(`Known traffic corridors nearby: ${nearby.corridors.join(', ')}.`);
      }
    }

    if (context.hotspots.length > 0) {
      const hotspotNames = context.hotspots.slice(0, 3).map((h) => h.junction);
      parts.push(`Nearby hotspot junctions: ${hotspotNames.join(', ')}.`);
    }

    return parts.join(' ');
  }

  private generateReasoning(event: Event, riskLevel: string, riskScore: number): string {
    const parts: string[] = [];

    parts.push(
      `Event "${event.name}" is a ${event.eventType.toLowerCase().replace('_', ' ')} ` +
      `at ${event.venue} with an expected crowd of ${event.expectedCrowd.toLocaleString()}.`
    );

    parts.push(
      `Risk assessment: ${riskLevel} (score: ${riskScore.toLocaleString()}). `
    );

    switch (event.eventType) {
      case 'SPORTS':
        parts.push('Sports events generate concentrated arrival peaks 1-2 hours before start and sudden departure surges at conclusion.');
        break;
      case 'FESTIVAL':
        parts.push('Festivals generate distributed arrivals over 3-4 hours with multiple entry points, reducing peak load but extending congestion duration.');
        break;
      case 'POLITICAL_RALLY':
        parts.push('Political rallies carry high uncertainty due to variable turnout and potential security requirements. Extra buffer applied.');
        break;
      case 'PROTEST':
        parts.push('Protests present highest uncertainty with potential road blockages. Risk multiplier elevated to account for unpredictable crowd behavior.');
        break;
      case 'CONSTRUCTION':
        parts.push('Construction activities produce prolonged, continuous disruptions due to lane reductions rather than crowd movement.');
        break;
      default:
        parts.push(`Standard risk profile applied for ${event.eventType.toLowerCase()} event type.`);
    }

    const hour = event.startTime.getHours();
    if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21)) {
      parts.push('Event timing coincides with rush hour, amplifying congestion risk by 30%.');
    }

    return parts.join(' ');
  }
}
