import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/response';
import { logger } from '../config/logger';

/**
 * POST /api/v1/traffic/upload
 * Upload a traffic video file
 * File is handled by Multer middleware before reaching this controller
 */
export async function uploadVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        error: 'No video file uploaded. Please provide a file with field name "video".',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // For now, return local file path. Phase 5 will add Cloudinary upload.
    const videoUrl = `/uploads/${file.filename}`;

    logger.info(`Video uploaded: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    sendSuccess(res, {
      videoUrl,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/traffic/current
 * Get the latest traffic snapshot from the most recent analysis
 */
export async function getCurrentTraffic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const latestAnalysis = await prisma.analysis.findFirst({
      where: {
        trafficSnapshot: { not: Prisma.JsonNull },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        trafficSnapshot: true,
        createdAt: true,
        event: {
          select: { name: true, venue: true },
        },
      },
    });

    if (!latestAnalysis) {
      sendSuccess(res, {
        message: 'No traffic data available yet. Upload a video or run an analysis first.',
      });
      return;
    }

    sendSuccess(res, {
      snapshot: latestAnalysis.trafficSnapshot,
      analysisId: latestAnalysis.id,
      event: latestAnalysis.event,
      capturedAt: latestAnalysis.createdAt,
    });
  } catch (error) {
    next(error);
  }
}
