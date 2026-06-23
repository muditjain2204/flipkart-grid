"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = uploadVideo;
exports.getCurrentTraffic = getCurrentTraffic;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const response_1 = require("../utils/response");
const logger_1 = require("../config/logger");
/**
 * POST /api/v1/traffic/upload
 * Upload a traffic video file
 * File is handled by Multer middleware before reaching this controller
 */
async function uploadVideo(req, res, next) {
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
        logger_1.logger.info(`Video uploaded: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        (0, response_1.sendSuccess)(res, {
            videoUrl,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
        }, 201);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/v1/traffic/current
 * Get the latest traffic snapshot from the most recent analysis
 */
async function getCurrentTraffic(req, res, next) {
    try {
        const latestAnalysis = await database_1.prisma.analysis.findFirst({
            where: {
                trafficSnapshot: { not: client_1.Prisma.JsonNull },
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
            (0, response_1.sendSuccess)(res, {
                message: 'No traffic data available yet. Upload a video or run an analysis first.',
            });
            return;
        }
        (0, response_1.sendSuccess)(res, {
            snapshot: latestAnalysis.trafficSnapshot,
            analysisId: latestAnalysis.id,
            event: latestAnalysis.event,
            capturedAt: latestAnalysis.createdAt,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=traffic.controller.js.map