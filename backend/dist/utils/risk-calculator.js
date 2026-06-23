"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRisk = calculateRisk;
exports.getDensityLevel = getDensityLevel;
const heuristics_1 = require("./heuristics");
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
function calculateRisk(expectedCrowd, eventType, startTime) {
    const typeMultiplier = heuristics_1.EVENT_RISK_MULTIPLIERS[eventType];
    const timeFactor = getTimeFactor(startTime);
    const riskScore = expectedCrowd * typeMultiplier * timeFactor;
    let riskLevel;
    if (riskScore > 150_000) {
        riskLevel = 'CRITICAL';
    }
    else if (riskScore > 50_000) {
        riskLevel = 'HIGH';
    }
    else if (riskScore > 10_000) {
        riskLevel = 'MODERATE';
    }
    else {
        riskLevel = 'LOW';
    }
    return { riskLevel, riskScore: Math.round(riskScore) };
}
/**
 * Get time-based risk factor.
 * Events during rush hours are worse; night events are less disruptive.
 */
function getTimeFactor(startTime) {
    const hour = startTime.getHours();
    const dayOfWeek = startTime.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let factor = 1.0;
    // Rush hour amplification
    if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 21)) {
        factor *= 1.3;
    }
    // Night reduction
    if (hour >= 22 || hour <= 5) {
        factor *= 0.7;
    }
    // Weekend reduction (less commuter traffic to compound with)
    if (isWeekend) {
        factor *= 0.9;
    }
    return factor;
}
/**
 * Get density level string from vehicle count.
 */
function getDensityLevel(vehiclesPerFrame) {
    if (vehiclesPerFrame > 50)
        return 'CRITICAL';
    if (vehiclesPerFrame > 30)
        return 'HIGH';
    if (vehiclesPerFrame > 15)
        return 'MODERATE';
    return 'LOW';
}
//# sourceMappingURL=risk-calculator.js.map