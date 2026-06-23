"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEventsQuerySchema = exports.EventParamsSchema = exports.UpdateEventSchema = exports.CreateEventSchema = void 0;
const zod_1 = require("zod");
// ─── Event Type Enum ─────────────────────────────────────
const eventTypeEnum = zod_1.z.enum([
    'SPORTS',
    'FESTIVAL',
    'POLITICAL_RALLY',
    'CONCERT',
    'CONSTRUCTION',
    'PROTEST',
    'RELIGIOUS',
    'OTHER',
]);
// ─── Base Event Schema (without refinements) ─────────────
const BaseEventSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, 'Event name must be at least 2 characters')
        .max(200, 'Event name must be under 200 characters'),
    venue: zod_1.z
        .string()
        .min(2, 'Venue must be at least 2 characters')
        .max(500, 'Venue must be under 500 characters'),
    eventType: eventTypeEnum,
    expectedCrowd: zod_1.z
        .number()
        .int()
        .min(0, 'Expected crowd cannot be negative')
        .max(1_000_000, 'Expected crowd seems unrealistically high'),
    startTime: zod_1.z
        .string()
        .datetime({ message: 'startTime must be a valid ISO 8601 datetime' }),
    endTime: zod_1.z
        .string()
        .datetime({ message: 'endTime must be a valid ISO 8601 datetime' }),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
    description: zod_1.z.string().max(2000).optional(),
});
// ─── Create Event Schema (with refinement) ───────────────
exports.CreateEventSchema = BaseEventSchema.refine((data) => new Date(data.endTime) > new Date(data.startTime), { message: 'endTime must be after startTime', path: ['endTime'] });
// ─── Update Event Schema ─────────────────────────────────
exports.UpdateEventSchema = BaseEventSchema.partial();
// ─── Params Schema ───────────────────────────────────────
exports.EventParamsSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Event ID is required'),
});
// ─── Query Schema (list with filters) ────────────────────
exports.ListEventsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1').transform(Number),
    limit: zod_1.z.string().optional().default('20').transform(Number),
    eventType: eventTypeEnum.optional(),
    sortBy: zod_1.z.enum(['createdAt', 'startTime', 'expectedCrowd']).optional().default('startTime'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
//# sourceMappingURL=event.schema.js.map