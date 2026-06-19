import { Router } from 'express';
import {
  listIncidents,
  getIncidentStats,
  getHotspots,
  getNearbyIncidents,
  getCorridorStats,
  getCorridorTemporalPattern,
  getZoneStats,
} from '../controllers/incidents.controller';

const router = Router();

// ─── Incident Queries ───────────────────────────────────

/**
 * GET /api/v1/incidents
 * Query: cause, corridor, zone, priority, startDate, endDate, limit, offset
 */
router.get('/', listIncidents);

/**
 * GET /api/v1/incidents/stats
 * Aggregate statistics across all incidents.
 */
router.get('/stats', getIncidentStats);

/**
 * GET /api/v1/incidents/hotspots
 * Query: limit (default: 15)
 */
router.get('/hotspots', getHotspots);

/**
 * GET /api/v1/incidents/nearby
 * Query: lat (required), lng (required), radius (default: 3km)
 */
router.get('/nearby', getNearbyIncidents);

/**
 * GET /api/v1/incidents/corridors/:name/stats
 * Detailed risk profile for a named corridor.
 */
router.get('/corridors/:name/stats', getCorridorStats);

/**
 * GET /api/v1/incidents/corridors/:name/temporal
 * Hour-of-day incident patterns for a corridor.
 */
router.get('/corridors/:name/temporal', getCorridorTemporalPattern);

/**
 * GET /api/v1/incidents/zones/:name/stats
 * Stats for a specific zone.
 */
router.get('/zones/:name/stats', getZoneStats);

export default router;
