"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const incidents_controller_1 = require("../controllers/incidents.controller");
const router = (0, express_1.Router)();
// ─── Incident Queries ───────────────────────────────────
/**
 * GET /api/v1/incidents
 * Query: cause, corridor, zone, priority, startDate, endDate, limit, offset
 */
router.get('/', incidents_controller_1.listIncidents);
/**
 * GET /api/v1/incidents/stats
 * Aggregate statistics across all incidents.
 */
router.get('/stats', incidents_controller_1.getIncidentStats);
/**
 * GET /api/v1/incidents/hotspots
 * Query: limit (default: 15)
 */
router.get('/hotspots', incidents_controller_1.getHotspots);
/**
 * GET /api/v1/incidents/nearby
 * Query: lat (required), lng (required), radius (default: 3km)
 */
router.get('/nearby', incidents_controller_1.getNearbyIncidents);
/**
 * GET /api/v1/incidents/corridors/:name/stats
 * Detailed risk profile for a named corridor.
 */
router.get('/corridors/:name/stats', incidents_controller_1.getCorridorStats);
/**
 * GET /api/v1/incidents/corridors/:name/temporal
 * Hour-of-day incident patterns for a corridor.
 */
router.get('/corridors/:name/temporal', incidents_controller_1.getCorridorTemporalPattern);
/**
 * GET /api/v1/incidents/zones/:name/stats
 * Stats for a specific zone.
 */
router.get('/zones/:name/stats', incidents_controller_1.getZoneStats);
exports.default = router;
//# sourceMappingURL=incidents.routes.js.map