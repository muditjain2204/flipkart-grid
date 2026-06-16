import { z } from 'zod';

// ─── Event Type Enum ─────────────────────────────────────

const eventTypeEnum = z.enum([
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

const BaseEventSchema = z.object({
  name: z
    .string()
    .min(2, 'Event name must be at least 2 characters')
    .max(200, 'Event name must be under 200 characters'),
  venue: z
    .string()
    .min(2, 'Venue must be at least 2 characters')
    .max(500, 'Venue must be under 500 characters'),
  eventType: eventTypeEnum,
  expectedCrowd: z
    .number()
    .int()
    .min(0, 'Expected crowd cannot be negative')
    .max(1_000_000, 'Expected crowd seems unrealistically high'),
  startTime: z
    .string()
    .datetime({ message: 'startTime must be a valid ISO 8601 datetime' }),
  endTime: z
    .string()
    .datetime({ message: 'endTime must be a valid ISO 8601 datetime' }),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  description: z.string().max(2000).optional(),
});

// ─── Create Event Schema (with refinement) ───────────────

export const CreateEventSchema = BaseEventSchema.refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: 'endTime must be after startTime', path: ['endTime'] }
);

// ─── Update Event Schema ─────────────────────────────────

export const UpdateEventSchema = BaseEventSchema.partial();

// ─── Params Schema ───────────────────────────────────────

export const EventParamsSchema = z.object({
  id: z.string().min(1, 'Event ID is required'),
});

// ─── Query Schema (list with filters) ────────────────────

export const ListEventsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  eventType: eventTypeEnum.optional(),
  sortBy: z.enum(['createdAt', 'startTime', 'expectedCrowd']).optional().default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ─── Type Exports ────────────────────────────────────────

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type ListEventsQuery = z.infer<typeof ListEventsQuerySchema>;
