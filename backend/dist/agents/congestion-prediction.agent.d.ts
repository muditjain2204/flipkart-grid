import { Agent, CongestionPredictionOutput, EventIntelligenceOutput, TrafficPerceptionOutput } from './index';
import { HistoricalContext } from '../services/historical-data.service';
interface CongestionInput {
    eventIntelligence: EventIntelligenceOutput;
    trafficPerception: TrafficPerceptionOutput;
    venue: string;
    historicalContext?: HistoricalContext;
}
export declare class CongestionPredictionAgent implements Agent<CongestionInput, CongestionPredictionOutput> {
    name: string;
    execute(input: CongestionInput): Promise<CongestionPredictionOutput>;
}
export {};
//# sourceMappingURL=congestion-prediction.agent.d.ts.map