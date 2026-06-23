import { z } from 'zod';
export declare const CreateEventSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    venue: z.ZodString;
    eventType: z.ZodEnum<["SPORTS", "FESTIVAL", "POLITICAL_RALLY", "CONCERT", "CONSTRUCTION", "PROTEST", "RELIGIOUS", "OTHER"]>;
    expectedCrowd: z.ZodNumber;
    startTime: z.ZodString;
    endTime: z.ZodString;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    venue: string;
    eventType: "SPORTS" | "FESTIVAL" | "POLITICAL_RALLY" | "CONCERT" | "CONSTRUCTION" | "PROTEST" | "RELIGIOUS" | "OTHER";
    expectedCrowd: number;
    startTime: string;
    endTime: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    description?: string | undefined;
}, {
    name: string;
    venue: string;
    eventType: "SPORTS" | "FESTIVAL" | "POLITICAL_RALLY" | "CONCERT" | "CONSTRUCTION" | "PROTEST" | "RELIGIOUS" | "OTHER";
    expectedCrowd: number;
    startTime: string;
    endTime: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    description?: string | undefined;
}>, {
    name: string;
    venue: string;
    eventType: "SPORTS" | "FESTIVAL" | "POLITICAL_RALLY" | "CONCERT" | "CONSTRUCTION" | "PROTEST" | "RELIGIOUS" | "OTHER";
    expectedCrowd: number;
    startTime: string;
    endTime: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    description?: string | undefined;
}, {
    name: string;
    venue: string;
    eventType: "SPORTS" | "FESTIVAL" | "POLITICAL_RALLY" | "CONCERT" | "CONSTRUCTION" | "PROTEST" | "RELIGIOUS" | "OTHER";
    expectedCrowd: number;
    startTime: string;
    endTime: string;
    latitude?: number | undefined;
    longitude?: number | undefined;
    description?: string | undefined;
}>;
export declare const UpdateEventSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    venue: z.ZodOptional<z.ZodString>;
    eventType: z.ZodOptional<z.ZodEnum<["SPORTS", "FESTIVAL", "POLITICAL_RALLY", "CONCERT", "CONSTRUCTION", "PROTEST", "RELIGIOUS", "OTHER"]>>;
    expectedCrowd: z.ZodOptional<z.ZodNumber>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    longitude: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    venue?: string | undefined;
    eventType?: "SPORTS" | "FESTIVAL" | "POLITICAL_RALLY" | "CONCERT" | "CONSTRUCTION" | "PROTEST" | "RELIGIOUS" | "OTHER" | undefined;
    expectedCrowd?: number | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    description?: string | undefined;
}, {
    name?: string | undefined;
    venue?: string | undefined;
    eventType?: "SPORTS" | "FESTIVAL" | "POLITICAL_RALLY" | "CONCERT" | "CONSTRUCTION" | "PROTEST" | "RELIGIOUS" | "OTHER" | undefined;
    expectedCrowd?: number | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    description?: string | undefined;
}>;
export declare const EventParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const ListEventsQuerySchema: z.ZodObject<{
    page: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, number, string | undefined>;
    eventType: z.ZodOptional<z.ZodEnum<["SPORTS", "FESTIVAL", "POLITICAL_RALLY", "CONCERT", "CONSTRUCTION", "PROTEST", "RELIGIOUS", "OTHER"]>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["createdAt", "startTime", "expectedCrowd"]>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "expectedCrowd" | "startTime" | "createdAt";
    sortOrder: "asc" | "desc";
    eventType?: "SPORTS" | "FESTIVAL" | "POLITICAL_RALLY" | "CONCERT" | "CONSTRUCTION" | "PROTEST" | "RELIGIOUS" | "OTHER" | undefined;
}, {
    eventType?: "SPORTS" | "FESTIVAL" | "POLITICAL_RALLY" | "CONCERT" | "CONSTRUCTION" | "PROTEST" | "RELIGIOUS" | "OTHER" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: "expectedCrowd" | "startTime" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type ListEventsQuery = z.infer<typeof ListEventsQuerySchema>;
//# sourceMappingURL=event.schema.d.ts.map