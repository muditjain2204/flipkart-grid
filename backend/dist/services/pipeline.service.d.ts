import { Event } from '@prisma/client';
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
export declare class PipelineService {
    private eventIntelAgent;
    private trafficPerceptionAgent;
    private congestionPredictionAgent;
    private resourcePlanningAgent;
    private diversionStrategyAgent;
    private decisionSynthesisAgent;
    private historicalDataService;
    /**
     * Run the full multi-agent pipeline for a given analysis.
     *
     * @param analysisId - The ID of the Analysis record to update
     * @param event - The Event object to analyze
     * @param videoUrl - Optional video URL for CV processing
     */
    run(analysisId: string, event: Event, videoUrl?: string): Promise<void>;
}
//# sourceMappingURL=pipeline.service.d.ts.map