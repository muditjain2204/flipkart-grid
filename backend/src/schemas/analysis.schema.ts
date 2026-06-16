import { z } from 'zod';

// ─── Analysis Trigger Schema ─────────────────────────────

export const RunAnalysisSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  videoUrl: z.string().url().optional(),
});

export const AnalysisParamsSchema = z.object({
  id: z.string().min(1, 'Analysis ID is required'),
});

// ─── Report Query Schema ─────────────────────────────────

export const ListReportsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']).optional(),
  riskLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).optional(),
});

// ─── Traffic Upload Schema ───────────────────────────────

export const TrafficUploadSchema = z.object({
  // File validation is handled by Multer; this is for any additional body fields
  cameraLocation: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// ─── Type Exports ────────────────────────────────────────

export type RunAnalysisInput = z.infer<typeof RunAnalysisSchema>;
export type ListReportsQuery = z.infer<typeof ListReportsQuerySchema>;
export type TrafficUploadInput = z.infer<typeof TrafficUploadSchema>;
