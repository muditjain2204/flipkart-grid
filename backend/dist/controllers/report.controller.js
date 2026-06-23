"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReports = getReports;
exports.getReportById = getReportById;
const database_1 = require("../config/database");
const response_1 = require("../utils/response");
const error_handler_1 = require("../middleware/error-handler");
/**
 * GET /api/v1/reports
 * List all completed analysis reports
 */
async function getReports(req, res, next) {
    try {
        const { page, limit, status, riskLevel } = req.query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (riskLevel)
            where.eventRiskLevel = riskLevel;
        const [reports, total] = await Promise.all([
            database_1.prisma.analysis.findMany({
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
            database_1.prisma.analysis.count({ where }),
        ]);
        (0, response_1.sendPaginated)(res, reports, total, page, limit);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/v1/reports/:id
 * Get a single full report
 */
async function getReportById(req, res, next) {
    try {
        const id = req.params.id;
        const report = await database_1.prisma.analysis.findUnique({
            where: { id },
            include: { event: true },
        });
        if (!report) {
            throw new error_handler_1.AppError('Report not found', 404);
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
        (0, response_1.sendSuccess)(res, response);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=report.controller.js.map