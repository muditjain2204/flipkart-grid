import { Event } from '@prisma/client';
import { Agent, EventIntelligenceOutput } from './index';
import { HistoricalContext } from '../services/historical-data.service';
export declare class EventIntelligenceAgent implements Agent<{
    event: Event;
    historicalContext?: HistoricalContext;
}, EventIntelligenceOutput> {
    name: string;
    execute(input: {
        event: Event;
        historicalContext?: HistoricalContext;
    }): Promise<EventIntelligenceOutput>;
}
//# sourceMappingURL=event-intelligence.agent.d.ts.map