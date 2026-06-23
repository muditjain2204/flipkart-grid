import { Event } from '@prisma/client';
import { Agent, DiversionStrategyOutput, CongestionPredictionOutput } from './index';
interface DiversionInput {
    congestion: CongestionPredictionOutput;
    event: Event;
}
export declare class DiversionStrategyAgent implements Agent<DiversionInput, DiversionStrategyOutput> {
    name: string;
    execute(input: DiversionInput): Promise<DiversionStrategyOutput>;
}
export {};
//# sourceMappingURL=diversion-strategy.agent.d.ts.map