"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONGESTION_BUFFER_MINUTES = exports.OFFICER_SEVERITY_MULTIPLIERS = exports.SEVERITY_MATRIX = exports.DEPARTURE_WINDOW_OFFSETS = exports.ARRIVAL_WINDOW_OFFSETS = exports.EVENT_RISK_MULTIPLIERS = void 0;
/**
 * Risk multipliers based on event type.
 * Higher values indicate higher potential for traffic disruption.
 */
exports.EVENT_RISK_MULTIPLIERS = {
    SPORTS: 1.5,
    FESTIVAL: 1.0,
    POLITICAL_RALLY: 2.0,
    CONCERT: 1.3,
    CONSTRUCTION: 0.8,
    PROTEST: 2.5,
    RELIGIOUS: 1.2,
    OTHER: 1.0,
};
/**
 * Arrival window offsets in hours relative to event start time.
 * [beforeStart, afterStart]
 */
exports.ARRIVAL_WINDOW_OFFSETS = {
    SPORTS: { beforeHours: 2, afterHours: -0.5 }, // 2hr before to 30min before
    FESTIVAL: { beforeHours: 3, afterHours: 1 }, // 3hr before to 1hr after start
    POLITICAL_RALLY: { beforeHours: 3, afterHours: 0 }, // 3hr before to start
    CONCERT: { beforeHours: 1.5, afterHours: -0.25 }, // 90min before to 15min before
    CONSTRUCTION: { beforeHours: 0.5, afterHours: 0 }, // 30min before to start (workers)
    PROTEST: { beforeHours: 4, afterHours: 1 }, // Very early, unpredictable
    RELIGIOUS: { beforeHours: 2, afterHours: 0.5 }, // 2hr before to 30min after
    OTHER: { beforeHours: 1, afterHours: 0 },
};
/**
 * Departure window offsets in hours relative to event end time.
 * [afterEnd, bufferAfterEnd]
 */
exports.DEPARTURE_WINDOW_OFFSETS = {
    SPORTS: { afterEndHours: 0, bufferHours: 1.5 }, // Immediate to 90min after
    FESTIVAL: { afterEndHours: -1, bufferHours: 2 }, // 1hr before end to 2hr after
    POLITICAL_RALLY: { afterEndHours: 0, bufferHours: 2 },
    CONCERT: { afterEndHours: 0, bufferHours: 1 },
    CONSTRUCTION: { afterEndHours: 0, bufferHours: 0.5 },
    PROTEST: { afterEndHours: 0, bufferHours: 3 }, // Can linger
    RELIGIOUS: { afterEndHours: 0, bufferHours: 1.5 },
    OTHER: { afterEndHours: 0, bufferHours: 1 },
};
/**
 * Congestion severity matrix based on risk level and density level.
 */
exports.SEVERITY_MATRIX = {
    'CRITICAL_CRITICAL': 'GRIDLOCK',
    'CRITICAL_HIGH': 'GRIDLOCK',
    'CRITICAL_MODERATE': 'SEVERE',
    'CRITICAL_LOW': 'MODERATE',
    'HIGH_CRITICAL': 'GRIDLOCK',
    'HIGH_HIGH': 'SEVERE',
    'HIGH_MODERATE': 'MODERATE',
    'HIGH_LOW': 'MILD',
    'MODERATE_CRITICAL': 'SEVERE',
    'MODERATE_HIGH': 'MODERATE',
    'MODERATE_MODERATE': 'MODERATE',
    'MODERATE_LOW': 'MILD',
    'LOW_CRITICAL': 'MODERATE',
    'LOW_HIGH': 'MILD',
    'LOW_MODERATE': 'MILD',
    'LOW_LOW': 'NONE',
};
/**
 * Officer deployment multipliers based on congestion severity.
 */
exports.OFFICER_SEVERITY_MULTIPLIERS = {
    GRIDLOCK: 2.0,
    SEVERE: 1.5,
    MODERATE: 1.0,
    MILD: 0.5,
    NONE: 0.25,
};
/**
 * Post-event congestion buffer in minutes based on severity.
 */
exports.CONGESTION_BUFFER_MINUTES = {
    GRIDLOCK: 90,
    SEVERE: 60,
    MODERATE: 30,
    MILD: 15,
    NONE: 0,
};
//# sourceMappingURL=heuristics.js.map