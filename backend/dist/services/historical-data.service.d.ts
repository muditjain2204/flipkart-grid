import { IncidentCause } from '@prisma/client';
export interface CorridorStats {
    corridor: string;
    totalIncidents: number;
    breakdownsByType: Record<string, number>;
    avgResolutionMinutes: number | null;
    highPriorityPercentage: number;
    roadClosurePercentage: number;
    topCauses: Array<{
        cause: string;
        count: number;
    }>;
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
    topCauses: Array<{
        cause: string;
        count: number;
    }>;
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
    topCorridors: Array<{
        corridor: string;
        count: number;
    }>;
}
export interface HistoricalContext {
    nearbyIncidents: NearbyIncidentSummary;
    corridorStats: CorridorStats[];
    hotspots: HotspotResult[];
}
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
export declare class HistoricalDataService {
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
    getIncidentsNearLocation(lat: number, lng: number, radiusKm?: number, limit?: number): Promise<NearbyIncidentSummary>;
    /**
     * Get detailed risk profile for a specific corridor.
     */
    getCorridorRiskProfile(corridor: string): Promise<CorridorStats | null>;
    /**
     * Get average resolution time by incident cause type.
     */
    getAverageResolutionTime(cause: IncidentCause): Promise<number | null>;
    /**
     * Get the most incident-prone junctions (hotspots).
     */
    getHotspots(limit?: number): Promise<HotspotResult[]>;
    /**
     * Get time-of-day incident patterns for a corridor.
     * Returns hourly incident counts with dominant cause.
     */
    getTemporalPattern(corridor: string): Promise<TemporalPattern[]>;
    /**
     * Get incident statistics for a zone.
     */
    getZoneStats(zone: string): Promise<ZoneStats | null>;
    /**
     * Get full historical context for a location — used by the pipeline
     * to enrich all agents with data-driven insights.
     *
     * @param lat - Event latitude
     * @param lng - Event longitude
     * @param radiusKm - Search radius (default: 3km for event impact area)
     */
    getContextForLocation(lat: number, lng: number, radiusKm?: number): Promise<HistoricalContext>;
    /**
     * Haversine distance between two points in km.
     */
    private haversineDistance;
}
//# sourceMappingURL=historical-data.service.d.ts.map