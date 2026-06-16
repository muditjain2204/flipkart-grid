import { Event } from '@prisma/client';
import { Agent, CongestionPredictionOutput, DiversionStrategyOutput } from './index';
import { logger } from '../config/logger';

interface DiversionInput {
  congestion: CongestionPredictionOutput;
  event: Event;
}

/**
 * Agent 5: Diversion Strategy Agent
 *
 * Suggests alternative routes, restricted zones, and public advisory messages
 * to minimize congestion spillover.
 *
 * In Phase 5, this will integrate with Mapbox Directions API for real routing.
 * Currently uses heuristic-based recommendations.
 */
export class DiversionStrategyAgent implements Agent<DiversionInput, DiversionStrategyOutput> {
  name = 'Diversion Strategy Agent';

  async execute(input: DiversionInput): Promise<DiversionStrategyOutput> {
    const { congestion, event } = input;

    logger.info(`[${this.name}] Generating diversions for severity=${congestion.congestionSeverity}`);

    // Generate diversion routes
    const diversionRoutes = this.generateDiversionRoutes(event, congestion);

    // Define restricted zones
    const restrictedZones = this.defineRestrictedZones(event, congestion);

    // Generate public advisory messages
    const advisoryMessages = this.generateAdvisories(event, congestion);

    // Generate reasoning
    const reasoning = this.generateReasoning(diversionRoutes, restrictedZones, congestion);

    logger.info(
      `[${this.name}] Strategy: ${diversionRoutes.length} diversions, ` +
      `${restrictedZones.length} restricted zones, ${advisoryMessages.length} advisories`
    );

    return {
      diversionRoutes,
      restrictedZones,
      advisoryMessages,
      reasoning,
    };
  }

  private generateDiversionRoutes(
    event: Event,
    congestion: CongestionPredictionOutput
  ): Array<{ from: string; to: string; via: string; estimatedTime: string }> {
    const routes: Array<{ from: string; to: string; via: string; estimatedTime: string }> = [];

    // Generate diversions based on impacted corridors
    congestion.impactedCorridors.forEach((corridor, index) => {
      routes.push({
        from: corridor,
        to: event.venue,
        via: `Alternative route ${index + 1} (bypass via secondary roads)`,
        estimatedTime: this.estimateDiversionTime(congestion.congestionSeverity, index),
      });
    });

    // Add at least one general diversion if none generated
    if (routes.length === 0) {
      routes.push({
        from: 'Main approach road',
        to: event.venue,
        via: 'Use secondary/parallel roads',
        estimatedTime: '25-35 min',
      });
    }

    return routes;
  }

  private estimateDiversionTime(severity: string, routeIndex: number): string {
    const baseMinutes: Record<string, number> = {
      GRIDLOCK: 45,
      SEVERE: 35,
      MODERATE: 25,
      MILD: 15,
      NONE: 10,
    };

    const base = baseMinutes[severity] || 25;
    const variation = routeIndex * 5; // Farther diversions take longer
    const min = base + variation;
    const max = min + 10;

    return `${min}-${max} min`;
  }

  private defineRestrictedZones(event: Event, congestion: CongestionPredictionOutput): string[] {
    const zones: string[] = [];

    if (congestion.congestionSeverity === 'GRIDLOCK' || congestion.congestionSeverity === 'SEVERE') {
      zones.push(`${event.venue} — 2km radius restricted for non-event traffic`);
      zones.push(`Primary approach road — event vehicles only during peak hours`);
      zones.push(`Emergency corridor — kept clear for ambulance/fire access`);
    } else if (congestion.congestionSeverity === 'MODERATE') {
      zones.push(`${event.venue} — 1km radius advisory zone`);
      zones.push(`Parking approach — controlled entry only`);
    } else {
      zones.push(`${event.venue} — immediate vicinity advisory`);
    }

    return zones;
  }

  private generateAdvisories(event: Event, congestion: CongestionPredictionOutput): string[] {
    const advisories: string[] = [];
    const peakStart = congestion.peakStartTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const peakEnd = congestion.peakEndTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Universal advisory
    advisories.push(
      `🚗 Traffic advisory for "${event.name}": Expect heavy traffic near ${event.venue} ` +
      `between ${peakStart} and ${peakEnd}. Plan your journey accordingly.`
    );

    // Public transport advisory
    advisories.push(
      `🚌 Use public transport (metro/bus) to reach ${event.venue}. ` +
      `Parking will be extremely limited during event hours.`
    );

    // Timing advisory
    if (congestion.congestionSeverity === 'GRIDLOCK' || congestion.congestionSeverity === 'SEVERE') {
      advisories.push(
        `⚠️ SEVERE congestion expected. Arrive at least 2 hours early or use alternative routes. ` +
        `Avoid the area if not attending the event.`
      );
      advisories.push(
        `🚑 Emergency corridor will be maintained. Do NOT block emergency access routes.`
      );
    }

    // Carpooling advisory for large events
    if (event.expectedCrowd > 50000) {
      advisories.push(
        `🚙 Carpooling is strongly recommended for this large event. ` +
        `Each car carrying 3+ passengers will reduce overall congestion significantly.`
      );
    }

    return advisories;
  }

  private generateReasoning(
    routes: Array<{ from: string; to: string; via: string; estimatedTime: string }>,
    restrictedZones: string[],
    congestion: CongestionPredictionOutput
  ): string {
    const parts: string[] = [];

    parts.push(
      `Generated ${routes.length} alternative diversion routes to distribute traffic ` +
      `away from ${congestion.impactedCorridors.length} impacted corridors.`
    );

    parts.push(
      `${restrictedZones.length} restricted zones defined to protect critical areas and maintain emergency access.`
    );

    parts.push(
      'Diversions are designed to avoid shifting congestion to nearby corridors. ' +
      'At least one emergency access route is maintained at all times.'
    );

    return parts.join(' ');
  }
}
