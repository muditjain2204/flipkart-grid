import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AppError } from '../middleware/error-handler';
import { ListReportsQuery } from '../schemas/analysis.schema';

/**
 * GET /api/v1/reports
 * List all completed analysis reports
 */
export async function getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, status, riskLevel } = req.query as unknown as ListReportsQuery;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (riskLevel) where.eventRiskLevel = riskLevel;

    const [reports, total] = await Promise.all([
      prisma.analysis.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: { id: true, name: true, venue: true, eventType: true, expectedCrowd: true },
          },
        },
      }),
      prisma.analysis.count({ where }),
    ]);

    sendPaginated(res, reports, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/reports/:id
 * Get a single full report
 */
export async function getReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const report = await prisma.analysis.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!report) {
      throw new AppError('Report not found', 404);
    }

    // Return the final report if available, otherwise the raw analysis
    const response = report.finalReport
      ? {
          report: report.finalReport,
          metadata: {
            analysisId: report.id,
            eventId: report.eventId,
            status: report.status,
            confidenceScore: report.confidenceScore,
            pipelineDurationMs: report.pipelineDurationMs,
            generatedAt: report.updatedAt,
          },
        }
      : report;

    sendSuccess(res, response);
  } catch (error) {
    next(error);
  }
}
