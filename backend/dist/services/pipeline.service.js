"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const event_intelligence_agent_1 = require("../agents/event-intelligence.agent");
const traffic_perception_agent_1 = require("../agents/traffic-perception.agent");
const congestion_prediction_agent_1 = require("../agents/congestion-prediction.agent");
const resource_planning_agent_1 = require("../agents/resource-planning.agent");
const diversion_strategy_agent_1 = require("../agents/diversion-strategy.agent");
const decision_synthesis_agent_1 = require("../agents/decision-synthesis.agent");
const historical_data_service_1 = require("./historical-data.service");
/**
 * Pipeline Service
 *
 * Orchestrates the multi-agent analysis pipeline:
 *   [Historical Data Fetch] → Agent 1 (Event Intel) → Agent 2 (Traffic CV)
 *   → Agent 3 (Congestion) → [Agent 4 (Resources) || Agent 5 (Diversions)]
 *   → Agent 6 (Synthesis)
 *
 * Agents 4 and 5 run in parallel since they're independent of each other.
 * The pipeline updates the Analysis record at each step.
 *
 * Historical data from the Astram dataset is fetched once at pipeline start
 * and passed to Agents 1, 3, and 4 to enrich their predictions.
 */
class PipelineService {
    eventIntelAgent = new event_intelligence_agent_1.EventIntelligenceAgent();
    trafficPerceptionAgent = new traffic_perception_agent_1.TrafficPerceptionAgent();
    congestionPredictionAgent = new congestion_prediction_agent_1.CongestionPredictionAgent();
    resourcePlanningAgent = new resource_planning_agent_1.ResourcePlanningAgent();
    diversionStrategyAgent = new diversion_strategy_agent_1.DiversionStrategyAgent();
    decisionSynthesisAgent = new decision_synthesis_agent_1.DecisionSynthesisAgent();
    historicalDataService = new historical_data_service_1.HistoricalDataService();
    /**
     * Run the full multi-agent pipeline for a given analysis.
     *
     * @param analysisId - The ID of the Analysis record to update
     * @param event - The Event object to analyze
     * @param videoUrl - Optional video URL for CV processing
     */
    async run(analysisId, event, videoUrl) {
        const startTime = Date.now();
        try {
            // Mark as running
            await database_1.prisma.analysis.update({
                where: { id: analysisId },
                data: { status: 'RUNNING' },
            });
            logger_1.logger.info(`🚀 Pipeline started for analysis ${analysisId} — event: "${event.name}"`);
            // ── Pre-step: Fetch Historical Context ──
            let historicalContext;
            if (event.latitude && event.longitude) {
                logger_1.logger.info(`[Pipeline] Fetching historical context for location (${event.latitude}, ${event.longitude})...`);
                try {
                    historicalContext = await this.historicalDataService.getContextForLocation(event.latitude, event.longitude, 3 // 3km radius
                    );
                    logger_1.logger.info(`[Pipeline] Historical context: ${historicalContext.nearbyIncidents.totalIncidents} nearby incidents, ` +
                        `${historicalContext.corridorStats.length} corridors, ${historicalContext.hotspots.length} hotspots`);
                }
                catch (histError) {
                    logger_1.logger.warn(`[Pipeline] Failed to fetch historical data, continuing without it: ${histError}`);
                }
            }
            else {
                logger_1.logger.info(`[Pipeline] No lat/lng available for event, skipping historical data lookup.`);
            }
            // ── Agent 1: Event Intelligence ──
            logger_1.logger.info(`[Pipeline] Running Agent 1: Event Intelligence...`);
            const eventIntelligence = await this.eventIntelAgent.execute({
                event,
                historicalContext,
            });
            await database_1.prisma.analysis.update({
                where: { id: analysisId },
                data: {
                    eventRiskLevel: eventIntelligence.eventRiskLevel,
                    riskScore: eventIntelligence.riskScore,
                    arrivalWindowStart: eventIntelligence.arrivalWindowStart,
                    arrivalWindowEnd: eventIntelligence.arrivalWindowEnd,
                    departureWindowStart: eventIntelligence.departureWindowStart,
                    departureWindowEnd: eventIntelligence.departureWindowEnd,
                },
            });
            // ── Agent 2: Traffic Perception ──
            logger_1.logger.info(`[Pipeline] Running Agent 2: Traffic Perception...`);
            const trafficPerception = await this.trafficPerceptionAgent.execute(videoUrl);
            await database_1.prisma.analysis.update({
                where: { id: analysisId },
                data: {
                    trafficSnapshot: trafficPerception,
                    videoUrl: videoUrl || null,
                },
            });
            // ── Agent 3: Congestion Prediction ──
            logger_1.logger.info(`[Pipeline] Running Agent 3: Congestion Prediction...`);
            const congestionPrediction = await this.congestionPredictionAgent.execute({
                eventIntelligence,
                trafficPerception,
                venue: event.venue,
                historicalContext,
            });
            await database_1.prisma.analysis.update({
                where: { id: analysisId },
                data: {
                    congestionSeverity: congestionPrediction.congestionSeverity,
                    peakStartTime: congestionPrediction.peakStartTime,
                    peakEndTime: congestionPrediction.peakEndTime,
                    impactedCorridors: congestionPrediction.impactedCorridors,
                    predictionConfidence: congestionPrediction.predictionConfidence,
                    predictionReasoning: congestionPrediction.reasoning,
                },
            });
            // ── Agents 4 & 5: Resource Planning + Diversion Strategy (parallel) ──
            logger_1.logger.info(`[Pipeline] Running Agents 4 & 5 in parallel: Resources + Diversions...`);
            const [resourcePlanning, diversionStrategy] = await Promise.all([
                this.resourcePlanningAgent.execute({
                    congestion: congestionPrediction,
                    event,
                    historicalContext,
                }),
                this.diversionStrategyAgent.execute({
                    congestion: congestionPrediction,
                    event,
                }),
            ]);
            await database_1.prisma.analysis.update({
                where: { id: analysisId },
                data: {
                    officersRequired: resourcePlanning.officersRequired,
                    barricadesRequired: resourcePlanning.barricadesRequired,
                    deploymentZones: resourcePlanning.deploymentZones,
                    patrolPriority: resourcePlanning.patrolPriority,
                    diversionRoutes: diversionStrategy.diversionRoutes,
                    restrictedZones: diversionStrategy.restrictedZones,
                    advisoryMessages: diversionStrategy.advisoryMessages,
                },
            });
            // ── Agent 6: Decision Synthesis ──
            logger_1.logger.info(`[Pipeline] Running Agent 6: Decision Synthesis...`);
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
            await database_1.prisma.analysis.update({
                where: { id: analysisId },
                data: {
                    status: 'COMPLETED',
                    finalReport: decisionSynthesis,
                    confidenceScore: decisionSynthesis.confidenceScore,
                    explanation: decisionSynthesis.explanation,
                    pipelineDurationMs: durationMs,
                },
            });
            logger_1.logger.info(`✅ Pipeline completed for analysis ${analysisId} in ${durationMs}ms. ` +
                `Confidence: ${(decisionSynthesis.confidenceScore * 100).toFixed(0)}%`);
        }
        catch (error) {
            const durationMs = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error(`❌ Pipeline failed for analysis ${analysisId}: ${errorMessage}`);
            await database_1.prisma.analysis.update({
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
exports.PipelineService = PipelineService;
//# sourceMappingURL=pipeline.service.js.map