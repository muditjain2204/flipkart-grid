import { Request, Response, NextFunction } from 'express';
/**
 * POST /api/v1/traffic/upload
 * Upload a traffic video file
 * File is handled by Multer middleware before reaching this controller
 */
export declare function uploadVideo(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/v1/traffic/current
 * Get the latest traffic snapshot from the most recent analysis
 */
export declare function getCurrentTraffic(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=traffic.controller.d.ts.map