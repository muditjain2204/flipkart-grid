"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAnalysis = runAnalysis;
exports.getAnalysisStatus = getAnalysisStatus;
exports.getAnalysisResult = getAnalysisResult;
const database_1 = require("../config/database");
const response_1 = require("../utils/response");
const error_handler_1 = require("../middleware/error-handler");
const pipeline_service_1 = require("../services/pipeline.service");
const logger_1 = require("../config/logger");
const pipelineService = new pipeline_service_1.PipelineService();
/**
 * POST /api/v1/analysis/run
 * Trigger the full multi-agent analysis pipeline for an event
 */
async function runAnalysis(req, res, next) {
    try {
        const { eventId, videoUrl } = req.body;
        // Verify event exists
        const event = await database_1.prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            throw new error_handler_1.AppError('Event not found', 404);
        }
        // Create a pending analysis record
        const analysis = await database_1.prisma.analysis.create({
            data: {
                eventId,
                status: 'PENDING',
                videoUrl: videoUrl || null,
            },
        });
        logger_1.logger.info(`Analysis triggered: ${analysis.id} for event ${eventId}`);
        // Run pipeline asynchronously — don't await
        pipelineService
            .run(analysis.id, event, videoUrl)
            .catch((error) => {
            logger_1.logger.error(`Pipeline failed for analysis ${analysis.id}:`, error);
        });
        // Immediately return 202 Accepted
        (0, response_1.sendSuccess)(res, {
            analysisId: analysis.id,
            status: 'PENDING',
            message: 'Analysis pipeline started. Poll /api/v1/analysis/:id/status for updates.',
        }, 202);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/v1/analysis/:id/status
 * Check the current status of an analysis
 */
async function getAnalysisStatus(req, res, next) {
    try {
        const id = req.params.id;
        const analysis = await database_1.prisma.analysis.findUnique({
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
            throw new error_handler_1.AppError('Analysis not found', 404);
        }
        (0, response_1.sendSuccess)(res, analysis);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/v1/analysis/:id/result
 * Get the full analysis result including final report
 */
async function getAnalysisResult(req, res, next) {
    try {
        const id = req.params.id;
        const analysis = await database_1.prisma.analysis.findUnique({
            where: { id },
            include: { event: true },
        });
        if (!analysis) {
            throw new error_handler_1.AppError('Analysis not found', 404);
        }
        if (analysis.status === 'PENDING' || analysis.status === 'RUNNING') {
            throw new error_handler_1.AppError(`Analysis is still ${analysis.status.toLowerCase()}. Please wait.`, 409);
        }
        (0, response_1.sendSuccess)(res, analysis);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=analysis.controller.js.map