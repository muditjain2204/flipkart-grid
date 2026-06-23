import { Request, Response, NextFunction } from 'express';
/**
 * GET /api/v1/reports
 * List all completed analysis reports
 */
export declare function getReports(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/v1/reports/:id
 * Get a single full report
 */
export declare function getReportById(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=report.controller.d.ts.map