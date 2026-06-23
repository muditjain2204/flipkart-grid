import { Event } from '@prisma/client';
import { Agent, EventIntelligenceOutput, TrafficPerceptionOutput, CongestionPredictionOutput, ResourcePlanningOutput, DiversionStrategyOutput, DecisionSynthesisOutput } from './index';
interface SynthesisInput {
    event: Event;
    eventIntelligence: EventIntelligenceOutput;
    trafficPerception: TrafficPerceptionOutput;
    congestionPrediction: CongestionPredictionOutput;
    resourcePlanning: ResourcePlanningOutput;
    diversionStrategy: DiversionStrategyOutput;
}
export declare class DecisionSynthesisAgent implements Agent<SynthesisInput, DecisionSynthesisOutput> {
    name: string;
    execute(input: SynthesisInput): Promise<DecisionSynthesisOutput>;
}
export {};
//# sourceMappingURL=decision-synthesis.agent.d.ts.map