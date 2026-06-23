import { Request, Response } from 'express';
/**
 * GET /api/v1/incidents
 * List incidents with optional filters.
 */
export declare function listIncidents(req: Request, res: Response): Promise<void>;
/**
 * GET /api/v1/incidents/stats
 * Get aggregate statistics about all incidents.
 */
export declare function getIncidentStats(_req: Request, res: Response): Promise<void>;
/**
 * GET /api/v1/incidents/hotspots
 * Get the most incident-prone junctions.
 */
export declare function getHotspots(req: Request, res: Response): Promise<void>;
/**
 * GET /api/v1/incidents/nearby
 * Get incidents near a specific location.
 */
export declare function getNearbyIncidents(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/v1/incidents/corridors/:name/stats
 * Get detailed stats for a specific corridor.
 */
export declare function getCorridorStats(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/v1/incidents/corridors/:name/temporal
 * Get time-of-day incident patterns for a corridor.
 */
export declare function getCorridorTemporalPattern(req: Request, res: Response): Promise<void>;
/**
 * GET /api/v1/incidents/zones/:name/stats
 * Get stats for a specific zone.
 */
export declare function getZoneStats(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=incidents.controller.d.ts.map