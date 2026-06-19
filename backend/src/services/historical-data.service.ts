import { IncidentCause, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

// ─── Types ──────────────────────────────────────────────

export interface CorridorStats {
  corridor: string;
  totalIncidents: number;
  breakdownsByType: Record<string, number>;
  avgResolutionMinutes: number | null;
  highPriorityPercentage: number;
  roadClosurePercentage: number;
  topCauses: Array<{ cause: string; count: number }>;
}

export interface HotspotResult {
  junction: string;
  corridor: string | null;
  zone: string | null;
  totalIncidents: number;
  latitude: number;
  longitude: number;
}

export interface NearbyIncidentSummary {
  totalIncidents: number;
  corridors: string[];
  topCauses: Array<{ cause: string; count: number }>;
  avgResolutionMinutes: number | null;
  highPriorityPercentage: number;
  recentIncidents: Array<{
    id: string;
    cause: string;
    address: string;
    startDatetime: Date;
    resolutionMinutes: number | null;
  }>;
}

export interface TemporalPattern {
  hourOfDay: number;
  incidentCount: number;
  dominantCause: string;
}

export interface ZoneStats {
  zone: string;
  totalIncidents: number;
  causeDistribution: Record<string, number>;
  avgResolutionMinutes: number | null;
  highPriorityPercentage: number;
  topCorridors: Array<{ corridor: string; count: number }>;
}

export interface HistoricalContext {
  nearbyIncidents: NearbyIncidentSummary;
  corridorStats: CorridorStats[];
  hotspots: HotspotResult[];
}

// ─── Service ────────────────────────────────────────────

/**
 * Historical Data Service
 *
 * Queries the TrafficIncident table populated from the Astram dataset
 * to provide data-driven intelligence to the agent pipeline.
 *
 * Key capabilities:
 * - Proximity-based incident search (Haversine approximation)
 * - Corridor risk profiling
 * - Hotspot identification
 * - Temporal pattern analysis
 * - Zone statistics
 */
export class HistoricalDataService {
  /**
   * Find incidents near a given lat/lng within a radius.
   * Uses bounding-box filtering for performance, then computes
   * approximate distance in the application layer.
   *
   * @param lat - Center latitude
   * @param lng - Center longitude
   * @param radiusKm - Search radius in kilometers (default: 2)
   * @param limit - Max results (default: 100)
   */
  async getIncidentsNearLocation(
    lat: number,
    lng: number,
    radiusKm: number = 2,
    limit: number = 100
  ): Promise<NearbyIncidentSummary> {
    logger.debug(`[HistoricalData] Searching incidents near (${lat}, ${lng}) within ${radiusKm}km`);

    // Bounding box approximation: 1 degree ≈ 111km
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const incidents = await prisma.trafficIncident.findMany({
      where: {
        latitude: { gte: lat - latDelta, lte: lat + latDelta },
        longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
      },
      orderBy: { startDatetime: 'desc' },
      take: limit,
    });

    if (incidents.length === 0) {
      return {
        totalIncidents: 0,
        corridors: [],
        topCauses: [],
        avgResolutionMinutes: null,
        highPriorityPercentage: 0,
        recentIncidents: [],
      };
    }

    // Aggregate stats
    const corridors = [...new Set(incidents.map((i) => i.corridor).filter(Boolean))] as string[];

    const causeCounts: Record<string, number> = {};
    incidents.forEach((i) => {
      causeCounts[i.cause] = (causeCounts[i.cause] || 0) + 1;
    });
    const topCauses = Object.entries(causeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cause, count]) => ({ cause, count }));

    const resolutionTimes = incidents
      .map((i) => i.resolutionMinutes)
      .filter((t): t is number => t !== null && t > 0);
    const avgResolutionMinutes =
      resolutionTimes.length > 0
        ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length)
        : null;

    const highPriorityCount = incidents.filter((i) => i.priority === 'HIGH').length;

    return {
      totalIncidents: incidents.length,
      corridors,
      topCauses,
      avgResolutionMinutes,
      highPriorityPercentage: Math.round((highPriorityCount / incidents.length) * 100),
      recentIncidents: incidents.slice(0, 5).map((i) => ({
        id: i.id,
        cause: i.cause,
        address: i.address,
        startDatetime: i.startDatetime,
        resolutionMinutes: i.resolutionMinutes,
      })),
    };
  }

  /**
   * Get detailed risk profile for a specific corridor.
   */
  async getCorridorRiskProfile(corridor: string): Promise<CorridorStats | null> {
    logger.debug(`[HistoricalData] Getting corridor profile: ${corridor}`);

    const incidents = await prisma.trafficIncident.findMany({
      where: { corridor },
    });

    if (incidents.length === 0) return null;

    // Cause distribution
    const causeCounts: Record<string, number> = {};
    incidents.forEach((i) => {
      causeCounts[i.cause] = (causeCounts[i.cause] || 0) + 1;
    });
    const topCauses = Object.entries(causeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([cause, count]) => ({ cause, count }));

    // Vehicle type distribution
    const vehCounts: Record<string, number> = {};
    incidents.forEach((i) => {
      if (i.vehicleType) {
        vehCounts[i.vehicleType] = (vehCounts[i.vehicleType] || 0) + 1;
      }
    });

    // Resolution time
    const resTimes = incidents
      .map((i) => i.resolutionMinutes)
      .filter((t): t is number => t !== null && t > 0);
    const avgRes = resTimes.length > 0
      ? Math.round(resTimes.reduce((a, b) => a + b, 0) / resTimes.length)
      : null;

    const highPriority = incidents.filter((i) => i.priority === 'HIGH').length;
    const roadClosures = incidents.filter((i) => i.requiresRoadClosure).length;

    return {
      corridor,
      totalIncidents: incidents.length,
      breakdownsByType: vehCounts,
      avgResolutionMinutes: avgRes,
      highPriorityPercentage: Math.round((highPriority / incidents.length) * 100),
      roadClosurePercentage: Math.round((roadClosures / incidents.length) * 100),
      topCauses,
    };
  }

  /**
   * Get average resolution time by incident cause type.
   */
  async getAverageResolutionTime(cause: IncidentCause): Promise<number | null> {
    const result = await prisma.trafficIncident.aggregate({
      where: {
        cause,
        resolutionMinutes: { not: null, gt: 0 },
      },
      _avg: { resolutionMinutes: true },
    });

    return result._avg.resolutionMinutes
      ? Math.round(result._avg.resolutionMinutes)
      : null;
  }

  /**
   * Get the most incident-prone junctions (hotspots).
   */
  async getHotspots(limit: number = 15): Promise<HotspotResult[]> {
    logger.debug(`[HistoricalData] Getting top ${limit} hotspots`);

    // Group by junction (only non-null)
    const junctionGroups = await prisma.trafficIncident.groupBy({
      by: ['junction'],
      _count: { id: true },
      where: {
        junction: { not: null },
      },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const hotspots: HotspotResult[] = [];

    for (const group of junctionGroups) {
      if (!group.junction) continue;

      // Get a representative incident for lat/lng and corridor info
      const representative = await prisma.trafficIncident.findFirst({
        where: { junction: group.junction },
        select: {
          latitude: true,
          longitude: true,
          corridor: true,
          zone: true,
        },
      });

      if (representative) {
        hotspots.push({
          junction: group.junction,
          corridor: representative.corridor,
          zone: representative.zone,
          totalIncidents: group._count.id,
          latitude: representative.latitude,
          longitude: representative.longitude,
        });
      }
    }

    return hotspots;
  }

  /**
   * Get time-of-day incident patterns for a corridor.
   * Returns hourly incident counts with dominant cause.
   */
  async getTemporalPattern(corridor: string): Promise<TemporalPattern[]> {
    logger.debug(`[HistoricalData] Getting temporal patterns for: ${corridor}`);

    const incidents = await prisma.trafficIncident.findMany({
      where: { corridor },
      select: { startDatetime: true, cause: true },
    });

    // Bucket by hour
    const hourBuckets: Map<number, { count: number; causes: Record<string, number> }> = new Map();

    for (let h = 0; h < 24; h++) {
      hourBuckets.set(h, { count: 0, causes: {} });
    }

    incidents.forEach((i) => {
      const hour = i.startDatetime.getHours();
      const bucket = hourBuckets.get(hour)!;
      bucket.count++;
      bucket.causes[i.cause] = (bucket.causes[i.cause] || 0) + 1;
    });

    return Array.from(hourBuckets.entries()).map(([hour, data]) => {
      const dominantCause = Object.entries(data.causes).sort(([, a], [, b]) => b - a)[0];
      return {
        hourOfDay: hour,
        incidentCount: data.count,
        dominantCause: dominantCause ? dominantCause[0] : 'NONE',
      };
    });
  }

  /**
   * Get incident statistics for a zone.
   */
  async getZoneStats(zone: string): Promise<ZoneStats | null> {
    logger.debug(`[HistoricalData] Getting zone stats for: ${zone}`);

    const incidents = await prisma.trafficIncident.findMany({
      where: { zone },
    });

    if (incidents.length === 0) return null;

    // Cause distribution
    const causeDistribution: Record<string, number> = {};
    incidents.forEach((i) => {
      causeDistribution[i.cause] = (causeDistribution[i.cause] || 0) + 1;
    });

    // Top corridors
    const corridorCounts: Record<string, number> = {};
    incidents.forEach((i) => {
      if (i.corridor) {
        corridorCounts[i.corridor] = (corridorCounts[i.corridor] || 0) + 1;
      }
    });
    const topCorridors = Object.entries(corridorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([corridor, count]) => ({ corridor, count }));

    // Resolution time
    const resTimes = incidents
      .map((i) => i.resolutionMinutes)
      .filter((t): t is number => t !== null && t > 0);
    const avgRes = resTimes.length > 0
      ? Math.round(resTimes.reduce((a, b) => a + b, 0) / resTimes.length)
      : null;

    const highPriority = incidents.filter((i) => i.priority === 'HIGH').length;

    return {
      zone,
      totalIncidents: incidents.length,
      causeDistribution,
      avgResolutionMinutes: avgRes,
      highPriorityPercentage: Math.round((highPriority / incidents.length) * 100),
      topCorridors,
    };
  }

  /**
   * Get full historical context for a location — used by the pipeline
   * to enrich all agents with data-driven insights.
   *
   * @param lat - Event latitude
   * @param lng - Event longitude
   * @param radiusKm - Search radius (default: 3km for event impact area)
   */
  async getContextForLocation(lat: number, lng: number, radiusKm: number = 3): Promise<HistoricalContext> {
    logger.info(`[HistoricalData] Building context for location (${lat}, ${lng})`);

    const nearbyIncidents = await this.getIncidentsNearLocation(lat, lng, radiusKm);

    // Get corridor stats for all nearby corridors
    const corridorStats: CorridorStats[] = [];
    for (const corridor of nearbyIncidents.corridors) {
      const stats = await this.getCorridorRiskProfile(corridor);
      if (stats) corridorStats.push(stats);
    }

    // Get hotspots near the location
    const allHotspots = await this.getHotspots(50);
    const hotspots = allHotspots.filter((h) => {
      const dist = this.haversineDistance(lat, lng, h.latitude, h.longitude);
      return dist <= radiusKm;
    });

    logger.info(
      `[HistoricalData] Context: ${nearbyIncidents.totalIncidents} nearby incidents, ` +
      `${corridorStats.length} corridors, ${hotspots.length} hotspots`
    );

    return { nearbyIncidents, corridorStats, hotspots };
  }

  /**
   * Haversine distance between two points in km.
   */
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
