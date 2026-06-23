import { Agent, TrafficPerceptionOutput } from './index';
export declare class TrafficPerceptionAgent implements Agent<string | undefined, TrafficPerceptionOutput> {
    name: string;
    execute(videoUrl?: string): Promise<TrafficPerceptionOutput>;
}
//# sourceMappingURL=traffic-perception.agent.d.ts.map