import { EventType } from '@prisma/client';
/**
 * Risk multipliers based on event type.
 * Higher values indicate higher potential for traffic disruption.
 */
export declare const EVENT_RISK_MULTIPLIERS: Record<EventType, number>;
/**
 * Arrival window offsets in hours relative to event start time.
 * [beforeStart, afterStart]
 */
export declare const ARRIVAL_WINDOW_OFFSETS: Record<EventType, {
    beforeHours: number;
    afterHours: number;
}>;
/**
 * Departure window offsets in hours relative to event end time.
 * [afterEnd, bufferAfterEnd]
 */
export declare const DEPARTURE_WINDOW_OFFSETS: Record<EventType, {
    afterEndHours: number;
    bufferHours: number;
}>;
/**
 * Congestion severity matrix based on risk level and density level.
 */
export declare const SEVERITY_MATRIX: Record<string, string>;
/**
 * Officer deployment multipliers based on congestion severity.
 */
export declare const OFFICER_SEVERITY_MULTIPLIERS: Record<string, number>;
/**
 * Post-event congestion buffer in minutes based on severity.
 */
export declare const CONGESTION_BUFFER_MINUTES: Record<string, number>;
//# sourceMappingURL=heuristics.d.ts.map