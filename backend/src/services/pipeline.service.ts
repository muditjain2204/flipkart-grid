import { Event } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { EventIntelligenceAgent } from '../agents/event-intelligence.agent';
import { TrafficPerceptionAgent } from '../agents/traffic-perception.agent';
import { CongestionPredictionAgent } from '../agents/congestion-prediction.agent';
import { ResourcePlanningAgent } from '../agents/resource-planning.agent';
import { DiversionStrategyAgent } from '../agents/diversion-strategy.agent';
import { DecisionSynthesisAgent } from '../agents/decision-synthesis.agent';

/**
 * Pipeline Service
 *
 * Orchestrates the multi-agent analysis pipeline:
 *   Agent 1 (Event Intel) → Agent 2 (Traffic CV) → Agent 3 (Congestion)
 *   → [Agent 4 (Resources) || Agent 5 (Diversions)] → Agent 6 (Synthesis)
 *
 * Agents 4 and 5 run in parallel since they're independent of each other.
 * The pipeline updates the Analysis record at each step.
 */
export class PipelineService {
  private eventIntelAgent = new EventIntelligenceAgent();
  private trafficPerceptionAgent = new TrafficPerceptionAgent();
  private congestionPredictionAgent = new CongestionPredictionAgent();
  private resourcePlanningAgent = new ResourcePlanningAgent();
  private diversionStrategyAgent = new DiversionStrategyAgent();
  private decisionSynthesisAgent = new DecisionSynthesisAgent();

  /**
   * Run the full multi-agent pipeline for a given analysis.
   *
   * @param analysisId - The ID of the Analysis record to update
   * @param event - The Event object to analyze
   * @param videoUrl - Optional video URL for CV processing
   */
  async run(analysisId: string, event: Event, videoUrl?: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Mark as running
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: 'RUNNING' },
      });

      logger.info(`🚀 Pipeline started for analysis ${analysisId} — event: "${event.name}"`);

      // ── Agent 1: Event Intelligence ──
      logger.info(`[Pipeline] Running Agent 1: Event Intelligence...`);
      const eventIntelligence = await this.eventIntelAgent.execute(event);

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          eventRiskLevel: eventIntelligence.eventRiskLevel as any,
          riskScore: eventIntelligence.riskScore,
          arrivalWindowStart: eventIntelligence.arrivalWindowStart,
          arrivalWindowEnd: eventIntelligence.arrivalWindowEnd,
          departureWindowStart: eventIntelligence.departureWindowStart,
          departureWindowEnd: eventIntelligence.departureWindowEnd,
        },
      });

      // ── Agent 2: Traffic Perception ──
      logger.info(`[Pipeline] Running Agent 2: Traffic Perception...`);
      const trafficPerception = await this.trafficPerceptionAgent.execute(videoUrl);

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          trafficSnapshot: trafficPerception as any,
          videoUrl: videoUrl || null,
        },
      });

      // ── Agent 3: Congestion Prediction ──
      logger.info(`[Pipeline] Running Agent 3: Congestion Prediction...`);
      const congestionPrediction = await this.congestionPredictionAgent.execute({
        eventIntelligence,
        trafficPerception,
        venue: event.venue,
      });

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          congestionSeverity: congestionPrediction.congestionSeverity as any,
          peakStartTime: congestionPrediction.peakStartTime,
          peakEndTime: congestionPrediction.peakEndTime,
          impactedCorridors: congestionPrediction.impactedCorridors,
          predictionConfidence: congestionPrediction.predictionConfidence,
          predictionReasoning: congestionPrediction.reasoning,
        },
      });

      // ── Agents 4 & 5: Resource Planning + Diversion Strategy (parallel) ──
      logger.info(`[Pipeline] Running Agents 4 & 5 in parallel: Resources + Diversions...`);
      const [resourcePlanning, diversionStrategy] = await Promise.all([
        this.resourcePlanningAgent.execute({
          congestion: congestionPrediction,
          event,
        }),
        this.diversionStrategyAgent.execute({
          congestion: congestionPrediction,
          event,
        }),
      ]);

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          officersRequired: resourcePlanning.officersRequired,
          barricadesRequired: resourcePlanning.barricadesRequired,
          deploymentZones: resourcePlanning.deploymentZones,
          patrolPriority: resourcePlanning.patrolPriority as any,
          diversionRoutes: diversionStrategy.diversionRoutes as any,
          restrictedZones: diversionStrategy.restrictedZones,
          advisoryMessages: diversionStrategy.advisoryMessages,
        },
      });

      // ── Agent 6: Decision Synthesis ──
      logger.info(`[Pipeline] Running Agent 6: Decision Synthesis...`);
      const decisionSynthesis = await this.decisionSynthesisAgent.execute({
        event,
        eventIntelligence,
        trafficPerception,
        congestionPrediction,
        resourcePlanning,
        diversionStrategy,
      });

      // ── Final Update ──
      const durationMs = Date.now() - startTime;

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          finalReport: decisionSynthesis as any,
          confidenceScore: decisionSynthesis.confidenceScore,
          explanation: decisionSynthesis.explanation,
          pipelineDurationMs: durationMs,
        },
      });

      logger.info(
        `✅ Pipeline completed for analysis ${analysisId} in ${durationMs}ms. ` +
        `Confidence: ${(decisionSynthesis.confidenceScore * 100).toFixed(0)}%`
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(`❌ Pipeline failed for analysis ${analysisId}: ${errorMessage}`);

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'FAILED',
          errorLog: errorMessage,
          pipelineDurationMs: durationMs,
        },
      });
    }
  }
}
