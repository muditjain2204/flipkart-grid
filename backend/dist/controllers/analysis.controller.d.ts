import { Request, Response, NextFunction } from 'express';
/**
 * POST /api/v1/analysis/run
 * Trigger the full multi-agent analysis pipeline for an event
 */
export declare function runAnalysis(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/v1/analysis/:id/status
 * Check the current status of an analysis
 */
export declare function getAnalysisStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/v1/analysis/:id/result
 * Get the full analysis result including final report
 */
export declare function getAnalysisResult(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=analysis.controller.d.ts.map