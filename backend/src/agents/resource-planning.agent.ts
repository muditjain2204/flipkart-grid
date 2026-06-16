import { Event } from '@prisma/client';
import { Agent, CongestionPredictionOutput, ResourcePlanningOutput } from './index';
import { OFFICER_SEVERITY_MULTIPLIERS } from '../utils/heuristics';
import { logger } from '../config/logger';

interface ResourceInput {
  congestion: CongestionPredictionOutput;
  event: Event;
}

/**
 * Agent 4: Resource Planning Agent
 *
 * Recommends manpower deployment, barricade placement, and patrol priorities
 * based on congestion severity predictions.
 *
 * Formulas:
 *   officers = ceil(expectedCrowd / 2000 × severityMultiplier)
 *   barricades = (corridors × 3) + (deploymentZones × 2)
 */
export class ResourcePlanningAgent implements Agent<ResourceInput, ResourcePlanningOutput> {
  name = 'Resource Planning Agent';

  async execute(input: ResourceInput): Promise<ResourcePlanningOutput> {
    const { congestion, event } = input;

    logger.info(`[${this.name}] Planning resources for severity=${congestion.congestionSeverity}`);

    // Calculate officers required
    const severityMultiplier = OFFICER_SEVERITY_MULTIPLIERS[congestion.congestionSeverity] || 1.0;
    const baseOfficers = event.expectedCrowd / 2000;
    const officersRequired = Math.max(2, Math.ceil(baseOfficers * severityMultiplier));

    // Identify deployment zones
    const deploymentZones = this.identifyDeploymentZones(event, congestion);

    // Calculate barricades
    const barricadesRequired = (congestion.impactedCorridors.length * 3) + (deploymentZones.length * 2);

    // Assign patrol priorities
    const patrolPriority = deploymentZones.map((zone, index) => ({
      zone,
      priority: index + 1, // Lower number = higher priority
    }));

    // Generate reasoning
    const reasoning = this.generateReasoning(
      officersRequired, barricadesRequired, deploymentZones, congestion, event
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
    event: Event
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

    parts.push(
      `Highest priority zones should be staffed first: ${zones.slice(0, 2).join(', ')}.`
    );

    return parts.join(' ');
  }
}
