import { Event } from '@prisma/client';
import { Agent, EventIntelligenceOutput } from './index';
import { calculateRisk } from '../utils/risk-calculator';
import { ARRIVAL_WINDOW_OFFSETS, DEPARTURE_WINDOW_OFFSETS } from '../utils/heuristics';
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
 */
export class EventIntelligenceAgent implements Agent<Event, EventIntelligenceOutput> {
  name = 'Event Intelligence Agent';

  async execute(event: Event): Promise<EventIntelligenceOutput> {
    logger.info(`[${this.name}] Analyzing event: ${event.name} (${event.eventType})`);

    // Calculate risk level
    const { riskLevel, riskScore } = calculateRisk(
      event.expectedCrowd,
      event.eventType,
      event.startTime
    );

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
    const reasoning = this.generateReasoning(event, riskLevel, riskScore);

    logger.info(
      `[${this.name}] Result: Risk=${riskLevel} (score=${riskScore}), ` +
      `Arrival=${arrivalWindowStart.toISOString()} to ${arrivalWindowEnd.toISOString()}`
    );

    return {
      eventRiskLevel: riskLevel,
      riskScore,
      arrivalWindowStart,
      arrivalWindowEnd,
      departureWindowStart,
      departureWindowEnd,
      reasoning,
    };
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
