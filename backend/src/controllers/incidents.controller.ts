import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { HistoricalDataService } from '../services/historical-data.service';
import { sendSuccess, sendError } from '../utils/response';

const historicalService = new HistoricalDataService();

/**
 * GET /api/v1/incidents
 * List incidents with optional filters.
 */
export async function listIncidents(req: Request, res: Response) {
  try {
    const {
      cause,
      corridor,
      zone,
      priority,
      startDate,
      endDate,
      limit = '50',
      offset = '0',
    } = req.query;

    const where: any = {};

    if (cause) where.cause = String(cause);
    if (corridor) where.corridor = String(corridor);
    if (zone) where.zone = String(zone);
    if (priority) where.priority = String(priority).toUpperCase();

    if (startDate || endDate) {
      where.startDatetime = {};
      if (startDate) where.startDatetime.gte = new Date(String(startDate));
      if (endDate) where.startDatetime.lte = new Date(String(endDate));
    }

    const [incidents, total] = await Promise.all([
      prisma.trafficIncident.findMany({
        where,
        orderBy: { startDatetime: 'desc' },
        take: Math.min(parseInt(String(limit)), 100),
        skip: parseInt(String(offset)),
      }),
      prisma.trafficIncident.count({ where }),
    ]);

    sendSuccess(res, {
      incidents,
      pagination: {
        total,
        limit: parseInt(String(limit)),
        offset: parseInt(String(offset)),
      },
    });
  } catch (error) {
    sendError(res, 'Failed to fetch incidents', 500);
  }
}

/**
 * GET /api/v1/incidents/stats
 * Get aggregate statistics about all incidents.
 */
export async function getIncidentStats(_req: Request, res: Response) {
  try {
    const [total, causeGroups, corridorGroups, zoneGroups, typeGroups] = await Promise.all([
      prisma.trafficIncident.count(),
      prisma.trafficIncident.groupBy({
        by: ['cause'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.trafficIncident.groupBy({
        by: ['corridor'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 15,
      }),
      prisma.trafficIncident.groupBy({
        by: ['zone'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.trafficIncident.groupBy({
        by: ['incidentType'],
        _count: { id: true },
      }),
    ]);

    const avgResolution = await prisma.trafficIncident.aggregate({
      _avg: { resolutionMinutes: true },
      where: { resolutionMinutes: { not: null, gt: 0 } },
    });

    sendSuccess(res, {
      totalIncidents: total,
      avgResolutionMinutes: avgResolution._avg.resolutionMinutes
        ? Math.round(avgResolution._avg.resolutionMinutes)
        : null,
      byType: typeGroups.map((g) => ({ type: g.incidentType, count: g._count.id })),
      byCause: causeGroups.map((g) => ({ cause: g.cause, count: g._count.id })),
      byCorridor: corridorGroups.map((g) => ({ corridor: g.corridor || 'Unknown', count: g._count.id })),
      byZone: zoneGroups
        .filter((g) => g.zone)
        .map((g) => ({ zone: g.zone, count: g._count.id })),
    });
  } catch (error) {
    sendError(res, 'Failed to fetch incident stats', 500);
  }
}

/**
 * GET /api/v1/incidents/hotspots
 * Get the most incident-prone junctions.
 */
export async function getHotspots(req: Request, res: Response) {
  try {
    const limit = parseInt(String(req.query.limit || '15'));
    const hotspots = await historicalService.getHotspots(limit);

    sendSuccess(res, { hotspots });
  } catch (error) {
    sendError(res, 'Failed to fetch hotspots', 500);
  }
}

/**
 * GET /api/v1/incidents/nearby
 * Get incidents near a specific location.
 */
export async function getNearbyIncidents(req: Request, res: Response) {
  try {
    const lat = parseFloat(String(req.query.lat));
    const lng = parseFloat(String(req.query.lng));
    const radius = parseFloat(String(req.query.radius || '3'));

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'lat and lng query parameters are required',
      });
    }

    const summary = await historicalService.getIncidentsNearLocation(lat, lng, radius);
    sendSuccess(res, summary);
  } catch (error) {
    sendError(res, 'Failed to fetch nearby incidents', 500);
  }
}

/**
 * GET /api/v1/incidents/corridors/:name/stats
 * Get detailed stats for a specific corridor.
 */
export async function getCorridorStats(req: Request, res: Response) {
  try {
    const name = req.params.name as string;
    const stats = await historicalService.getCorridorRiskProfile(name);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: `Corridor '${name}' not found or has no incident data`,
      });
    }

    sendSuccess(res, stats);
  } catch (error) {
    sendError(res, 'Failed to fetch corridor stats', 500);
  }
}

/**
 * GET /api/v1/incidents/corridors/:name/temporal
 * Get time-of-day incident patterns for a corridor.
 */
export async function getCorridorTemporalPattern(req: Request, res: Response) {
  try {
    const name = req.params.name as string;
    const pattern = await historicalService.getTemporalPattern(name);

    sendSuccess(res, { corridor: name, pattern });
  } catch (error) {
    sendError(res, 'Failed to fetch temporal pattern', 500);
  }
}

/**
 * GET /api/v1/incidents/zones/:name/stats
 * Get stats for a specific zone.
 */
export async function getZoneStats(req: Request, res: Response) {
  try {
    const name = req.params.name as string;
    const stats = await historicalService.getZoneStats(name);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: `Zone '${name}' not found or has no incident data`,
      });
    }

    sendSuccess(res, stats);
  } catch (error) {
    sendError(res, 'Failed to fetch zone stats', 500);
  }
}
