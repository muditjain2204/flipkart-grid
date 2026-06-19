import { Event } from '@prisma/client';
import { Agent, CongestionPredictionOutput, ResourcePlanningOutput } from './index';
import { OFFICER_SEVERITY_MULTIPLIERS } from '../utils/heuristics';
import { HistoricalContext, HotspotResult } from '../services/historical-data.service';
import { logger } from '../config/logger';

interface ResourceInput {
  congestion: CongestionPredictionOutput;
  event: Event;
  historicalContext?: HistoricalContext;
}

/**
 * Agent 4: Resource Planning Agent
 *
 * Recommends manpower deployment, barricade placement, and patrol priorities
 * based on congestion severity predictions.
 *
 * When historical data is available, uses real hotspot junctions and
 * high-incident corridors for deployment zone recommendations.
 *
 * Formulas:
 *   officers = ceil(expectedCrowd / 2000 × severityMultiplier)
 *   barricades = (corridors × 3) + (deploymentZones × 2)
 */
export class ResourcePlanningAgent implements Agent<ResourceInput, ResourcePlanningOutput> {
  name = 'Resource Planning Agent';

  async execute(input: ResourceInput): Promise<ResourcePlanningOutput> {
    const { congestion, event, historicalContext } = input;

    logger.info(`[${this.name}] Planning resources for severity=${congestion.congestionSeverity}`);

    // Calculate officers required
    const severityMultiplier = OFFICER_SEVERITY_MULTIPLIERS[congestion.congestionSeverity] || 1.0;
    const baseOfficers = event.expectedCrowd / 2000;
    const officersRequired = Math.max(2, Math.ceil(baseOfficers * severityMultiplier));

    // Identify deployment zones — enhanced with historical hotspots
    const deploymentZones = historicalContext
      ? this.identifyDeploymentZonesWithHistory(event, congestion, historicalContext)
      : this.identifyDeploymentZones(event, congestion);

    // Calculate barricades
    const barricadesRequired = (congestion.impactedCorridors.length * 3) + (deploymentZones.length * 2);

    // Assign patrol priorities
    const patrolPriority = deploymentZones.map((zone, index) => ({
      zone,
      priority: index + 1, // Lower number = higher priority
    }));

    // Generate reasoning
    const reasoning = this.generateReasoning(
      officersRequired, barricadesRequired, deploymentZones, congestion, event, historicalContext
    );

    logger.info(
      `[${this.name}] Plan: ${officersRequired} officers, ${barricadesRequired} barricades, ` +
      `${deploymentZones.length} zones`
    );

    return {
      officersRequired,
      barricadesRequired,
      deploymentZones,
      patrolPriority,
      reasoning,
    };
  }

  /**
   * Enhanced deployment zone identification using real hotspot data.
   * Prioritizes actual high-incident junctions from the Astram dataset.
   */
  private identifyDeploymentZonesWithHistory(
    event: Event,
    congestion: CongestionPredictionOutput,
    context: HistoricalContext
  ): string[] {
    const zones: string[] = [];

    // Primary zones — always present
    zones.push(`Main entrance/gate area at ${event.venue}`);
    zones.push(`Primary parking zone near ${event.venue}`);

    // Add real hotspot junctions from historical data
    if (context.hotspots.length > 0) {
      const hotspotZones = context.hotspots
        .slice(0, congestion.congestionSeverity === 'GRIDLOCK' ? 5 : 3)
        .map((hs) => `${hs.junction} (historical hotspot: ${hs.totalIncidents} past incidents)`);
      zones.push(...hotspotZones);
    }

    // Add corridor-based zones from historical data
    if (congestion.congestionSeverity === 'GRIDLOCK' || congestion.congestionSeverity === 'SEVERE') {
      zones.push(`Public transport hub/Metro station approach`);

      // High-incident corridors that need extra attention
      for (const cs of context.corridorStats.slice(0, 2)) {
        if (cs.roadClosurePercentage > 5) {
          zones.push(`Road closure control point - ${cs.corridor}`);
        }
      }
    }

    return zones;
  }

  /**
   * Fallback deployment zone identification without historical data.
   */
  private identifyDeploymentZones(event: Event, congestion: CongestionPredictionOutput): string[] {
    const zones: string[] = [];

    // Primary zones — always present
    zones.push(`Main entrance/gate area at ${event.venue}`);
    zones.push(`Primary parking zone near ${event.venue}`);

    // Severity-based additional zones
    if (congestion.congestionSeverity === 'GRIDLOCK' || congestion.congestionSeverity === 'SEVERE') {
      zones.push(`Traffic control point - Highway junction nearest to ${event.venue}`);
      zones.push(`Secondary parking overflow zone`);
      zones.push(`Public transport hub/Metro station approach`);

      // Add corridor-based zones
      congestion.impactedCorridors.slice(0, 3).forEach((corridor) => {
        zones.push(`Intersection control - ${corridor}`);
      });
    } else if (congestion.congestionSeverity === 'MODERATE') {
      zones.push(`Key intersection near ${event.venue}`);
      zones.push(`Parking approach road`);
    }

    return zones;
  }

  private generateReasoning(
    officers: number,
    barricades: number,
    zones: string[],
    congestion: CongestionPredictionOutput,
    event: Event,
    historicalContext?: HistoricalContext
  ): string {
    const parts: string[] = [];

    parts.push(
      `For "${event.name}" with ${event.expectedCrowd.toLocaleString()} expected attendees ` +
      `and ${congestion.congestionSeverity} congestion severity:`
    );

    parts.push(
      `Deploying ${officers} traffic officers across ${zones.length} zones. ` +
      `${barricades} barricades recommended for corridor control.`
    );

    if (congestion.congestionSeverity === 'GRIDLOCK') {
      parts.push('GRIDLOCK-level severity requires maximum deployment with officers at every critical junction.');
    }

    // Add historical insight to reasoning
    if (historicalContext && historicalContext.hotspots.length > 0) {
      const hotspotNames = historicalContext.hotspots.slice(0, 3).map((h) => h.junction);
      parts.push(
        `Deployment prioritizes historically high-incident junctions: ${hotspotNames.join(', ')}. ` +
        `These locations have the most recorded traffic disruptions in the Astram dataset.`
      );
    }

    parts.push(
      `Highest priority zones should be staffed first: ${zones.slice(0, 2).join(', ')}.`
    );

    return parts.join(' ');
  }
}
