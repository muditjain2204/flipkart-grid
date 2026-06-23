import { EventType, RiskLevel } from '@prisma/client';
interface RiskResult {
    riskLevel: RiskLevel;
    riskScore: number;
}
/**
 * Calculate event risk level based on crowd size, event type, and timing.
 *
 * Risk Score Formula:
 *   score = expectedCrowd × typeMultiplier × timeFactor
 *
 * Time Factor:
 *   - Events during rush hours (7-10 AM, 5-9 PM): 1.3×
 *   - Weekend events: 0.9× (less commuter traffic)
 *   - Night events (after 10 PM): 0.7×
 *   - Default: 1.0×
 */
export declare function calculateRisk(expectedCrowd: number, eventType: EventType, startTime: Date): RiskResult;
/**
 * Get density level string from vehicle count.
 */
export declare function getDensityLevel(vehiclesPerFrame: number): string;
export {};
//# sourceMappingURL=risk-calculator.d.ts.map