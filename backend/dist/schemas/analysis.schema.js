"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficUploadSchema = exports.ListReportsQuerySchema = exports.AnalysisParamsSchema = exports.RunAnalysisSchema = void 0;
const zod_1 = require("zod");
// ─── Analysis Trigger Schema ─────────────────────────────
exports.RunAnalysisSchema = zod_1.z.object({
    eventId: zod_1.z.string().min(1, 'Event ID is required'),
    videoUrl: zod_1.z.string().url().optional(),
});
exports.AnalysisParamsSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Analysis ID is required'),
});
// ─── Report Query Schema ─────────────────────────────────
exports.ListReportsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1').transform(Number),
    limit: zod_1.z.string().optional().default('20').transform(Number),
    status: zod_1.z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']).optional(),
    riskLevel: zod_1.z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).optional(),
});
// ─── Traffic Upload Schema ───────────────────────────────
exports.TrafficUploadSchema = zod_1.z.object({
    // File validation is handled by Multer; this is for any additional body fields
    cameraLocation: zod_1.z.string().optional(),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
});
//# sourceMappingURL=analysis.schema.js.map