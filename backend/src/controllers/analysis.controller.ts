import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error-handler';
import { RunAnalysisInput } from '../schemas/analysis.schema';
import { PipelineService } from '../services/pipeline.service';
import { logger } from '../config/logger';

const pipelineService = new PipelineService();

/**
 * POST /api/v1/analysis/run
 * Trigger the full multi-agent analysis pipeline for an event
 */
export async function runAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { eventId, videoUrl } = req.body as RunAnalysisInput;

    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Create a pending analysis record
    const analysis = await prisma.analysis.create({
      data: {
        eventId,
        status: 'PENDING',
        videoUrl: videoUrl || null,
      },
    });

    logger.info(`Analysis triggered: ${analysis.id} for event ${eventId}`);

    // Run pipeline asynchronously — don't await
    pipelineService
      .run(analysis.id, event, videoUrl)
      .catch((error) => {
        logger.error(`Pipeline failed for analysis ${analysis.id}:`, error);
      });

    // Immediately return 202 Accepted
    sendSuccess(res, {
      analysisId: analysis.id,
      status: 'PENDING',
      message: 'Analysis pipeline started. Poll /api/v1/analysis/:id/status for updates.',
    }, 202);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analysis/:id/status
 * Check the current status of an analysis
 */
export async function getAnalysisStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        eventRiskLevel: true,
        congestionSeverity: true,
        confidenceScore: true,
        pipelineDurationMs: true,
        errorLog: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    sendSuccess(res, analysis);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analysis/:id/result
 * Get the full analysis result including final report
 */
export async function getAnalysisResult(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    if (analysis.status === 'PENDING' || analysis.status === 'RUNNING') {
      throw new AppError(`Analysis is still ${analysis.status.toLowerCase()}. Please wait.`, 409);
    }

    sendSuccess(res, analysis);
  } catch (error) {
    next(error);
  }
}
