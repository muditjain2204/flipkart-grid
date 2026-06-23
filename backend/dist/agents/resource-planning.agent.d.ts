import { Event } from '@prisma/client';
import { Agent, ResourcePlanningOutput, CongestionPredictionOutput } from './index';
import { HistoricalContext } from '../services/historical-data.service';
interface ResourceInput {
    congestion: CongestionPredictionOutput;
    event: Event;
    historicalContext?: HistoricalContext;
}
export declare class ResourcePlanningAgent implements Agent<ResourceInput, ResourcePlanningOutput> {
    name: string;
    execute(input: ResourceInput): Promise<ResourcePlanningOutput>;
}
export {};
//# sourceMappingURL=resource-planning.agent.d.ts.map