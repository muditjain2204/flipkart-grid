"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoricalDataService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
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
class HistoricalDataService {
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
    async getIncidentsNearLocation(lat, lng, radiusKm = 2, limit = 100) {
        logger_1.logger.debug(`[HistoricalData] Searching incidents near (${lat}, ${lng}) within ${radiusKm}km`);
        // Bounding box approximation: 1 degree ≈ 111km
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
        const incidents = await database_1.prisma.trafficIncident.findMany({
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
        const corridors = [...new Set(incidents.map((i) => i.corridor).filter(Boolean))];
        const causeCounts = {};
        incidents.forEach((i) => {
            causeCounts[i.cause] = (causeCounts[i.cause] || 0) + 1;
        });
        const topCauses = Object.entries(causeCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([cause, count]) => ({ cause, count }));
        const resolutionTimes = incidents
            .map((i) => i.resolutionMinutes)
            .filter((t) => t !== null && t > 0);
        const avgResolutionMinutes = resolutionTimes.length > 0
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
    async getCorridorRiskProfile(corridor) {
        logger_1.logger.debug(`[HistoricalData] Getting corridor profile: ${corridor}`);
        const incidents = await database_1.prisma.trafficIncident.findMany({
            where: { corridor },
        });
        if (incidents.length === 0)
            return null;
        // Cause distribution
        const causeCounts = {};
        incidents.forEach((i) => {
            causeCounts[i.cause] = (causeCounts[i.cause] || 0) + 1;
        });
        const topCauses = Object.entries(causeCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([cause, count]) => ({ cause, count }));
        // Vehicle type distribution
        const vehCounts = {};
        incidents.forEach((i) => {
            if (i.vehicleType) {
                vehCounts[i.vehicleType] = (vehCounts[i.vehicleType] || 0) + 1;
            }
        });
        // Resolution time
        const resTimes = incidents
            .map((i) => i.resolutionMinutes)
            .filter((t) => t !== null && t > 0);
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
    async getAverageResolutionTime(cause) {
        const result = await database_1.prisma.trafficIncident.aggregate({
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
    async getHotspots(limit = 15) {
        logger_1.logger.debug(`[HistoricalData] Getting top ${limit} hotspots`);
        // Group by junction (only non-null)
        const junctionGroups = await database_1.prisma.trafficIncident.groupBy({
            by: ['junction'],
            _count: { id: true },
            where: {
                junction: { not: null },
            },
            orderBy: { _count: { id: 'desc' } },
            take: limit,
        });
        const hotspots = [];
        for (const group of junctionGroups) {
            if (!group.junction)
                continue;
            // Get a representative incident for lat/lng and corridor info
            const representative = await database_1.prisma.trafficIncident.findFirst({
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
    async getTemporalPattern(corridor) {
        logger_1.logger.debug(`[HistoricalData] Getting temporal patterns for: ${corridor}`);
        const incidents = await database_1.prisma.trafficIncident.findMany({
            where: { corridor },
            select: { startDatetime: true, cause: true },
        });
        // Bucket by hour
        const hourBuckets = new Map();
        for (let h = 0; h < 24; h++) {
            hourBuckets.set(h, { count: 0, causes: {} });
        }
        incidents.forEach((i) => {
            const hour = i.startDatetime.getHours();
            const bucket = hourBuckets.get(hour);
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
    async getZoneStats(zone) {
        logger_1.logger.debug(`[HistoricalData] Getting zone stats for: ${zone}`);
        const incidents = await database_1.prisma.trafficIncident.findMany({
            where: { zone },
        });
        if (incidents.length === 0)
            return null;
        // Cause distribution
        const causeDistribution = {};
        incidents.forEach((i) => {
            causeDistribution[i.cause] = (causeDistribution[i.cause] || 0) + 1;
        });
        // Top corridors
        const corridorCounts = {};
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
            .filter((t) => t !== null && t > 0);
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
    async getContextForLocation(lat, lng, radiusKm = 3) {
        logger_1.logger.info(`[HistoricalData] Building context for location (${lat}, ${lng})`);
        const nearbyIncidents = await this.getIncidentsNearLocation(lat, lng, radiusKm);
        // Get corridor stats for all nearby corridors
        const corridorStats = [];
        for (const corridor of nearbyIncidents.corridors) {
            const stats = await this.getCorridorRiskProfile(corridor);
            if (stats)
                corridorStats.push(stats);
        }
        // Get hotspots near the location
        const allHotspots = await this.getHotspots(50);
        const hotspots = allHotspots.filter((h) => {
            const dist = this.haversineDistance(lat, lng, h.latitude, h.longitude);
            return dist <= radiusKm;
        });
        logger_1.logger.info(`[HistoricalData] Context: ${nearbyIncidents.totalIncidents} nearby incidents, ` +
            `${corridorStats.length} corridors, ${hotspots.length} hotspots`);
        return { nearbyIncidents, corridorStats, hotspots };
    }
    /**
     * Haversine distance between two points in km.
     */
    haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
exports.HistoricalDataService = HistoricalDataService;
//# sourceMappingURL=historical-data.service.js.map