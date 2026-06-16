import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AppError } from '../middleware/error-handler';
import { CreateEventInput, UpdateEventInput, ListEventsQuery } from '../schemas/event.schema';
import { logger } from '../config/logger';

/**
 * POST /api/v1/events
 * Create a new event
 */
export async function createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as CreateEventInput;

    const event = await prisma.event.create({
      data: {
        name: data.name,
        venue: data.venue,
        eventType: data.eventType,
        expectedCrowd: data.expectedCrowd,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
      },
    });

    logger.info(`Event created: ${event.id} - ${event.name}`);
    sendSuccess(res, event, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/events
 * List all events with pagination and filters
 */
export async function getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, eventType, sortBy, sortOrder } = req.query as unknown as ListEventsQuery;
    const skip = (page - 1) * limit;

    const where = eventType ? { eventType } : {};

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { analyses: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    sendPaginated(res, events, total, page, limit);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/events/:id
 * Get a single event by ID with its analyses
 */
export async function getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    sendSuccess(res, event);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/events/:id
 * Update an event
 */
export async function updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = req.body as UpdateEventInput;

    // Check event exists
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Event not found', 404);
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
      },
    });

    logger.info(`Event updated: ${event.id}`);
    sendSuccess(res, event);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/events/:id
 * Delete an event and its analyses (cascade)
 */
export async function deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Event not found', 404);
    }

    await prisma.event.delete({ where: { id } });

    logger.info(`Event deleted: ${id}`);
    sendSuccess(res, { message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
}
