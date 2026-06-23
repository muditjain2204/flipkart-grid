import { z } from 'zod';
export declare const RunAnalysisSchema: z.ZodObject<{
    eventId: z.ZodString;
    videoUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    videoUrl?: string | undefined;
}, {
    eventId: string;
    videoUrl?: string | undefined;
}>;
export declare const AnalysisParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const ListReportsQuerySchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "RUNNING", "COMPLETED", "FAILED"]>>;
    riskLevel: z.ZodOptional<z.ZodEnum<["LOW", "MODERATE", "HIGH", "CRITICAL"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | undefined;
    riskLevel?: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | undefined;
}, {
    status?: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    riskLevel?: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | undefined;
}>;
export declare const TrafficUploadSchema: z.ZodObject<{
    cameraLocation: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    latitude?: number | undefined;
    longitude?: number | undefined;
    cameraLocation?: string | undefined;
}, {
    latitude?: number | undefined;
    longitude?: number | undefined;
    cameraLocation?: string | undefined;
}>;
export type RunAnalysisInput = z.infer<typeof RunAnalysisSchema>;
export type ListReportsQuery = z.infer<typeof ListReportsQuerySchema>;
export type TrafficUploadInput = z.infer<typeof TrafficUploadSchema>;
//# sourceMappingURL=analysis.schema.d.ts.map