"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvent = createEvent;
exports.getEvents = getEvents;
exports.getEventById = getEventById;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
const database_1 = require("../config/database");
const response_1 = require("../utils/response");
const error_handler_1 = require("../middleware/error-handler");
const logger_1 = require("../config/logger");
/**
 * POST /api/v1/events
 * Create a new event
 */
async function createEvent(req, res, next) {
    try {
        const data = req.body;
        const event = await database_1.prisma.event.create({
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
        logger_1.logger.info(`Event created: ${event.id} - ${event.name}`);
        (0, response_1.sendSuccess)(res, event, 201);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/v1/events
 * List all events with pagination and filters
 */
async function getEvents(req, res, next) {
    try {
        const { page, limit, eventType, sortBy, sortOrder } = req.query;
        const skip = (page - 1) * limit;
        const where = eventType ? { eventType } : {};
        const [events, total] = await Promise.all([
            database_1.prisma.event.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    _count: { select: { analyses: true } },
                },
            }),
            database_1.prisma.event.count({ where }),
        ]);
        (0, response_1.sendPaginated)(res, events, total, page, limit);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/v1/events/:id
 * Get a single event by ID with its analyses
 */
async function getEventById(req, res, next) {
    try {
        const id = req.params.id;
        const event = await database_1.prisma.event.findUnique({
            where: { id },
            include: {
                analyses: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
        if (!event) {
            throw new error_handler_1.AppError('Event not found', 404);
        }
        (0, response_1.sendSuccess)(res, event);
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/v1/events/:id
 * Update an event
 */
async function updateEvent(req, res, next) {
    try {
        const id = req.params.id;
        const data = req.body;
        // Check event exists
        const existing = await database_1.prisma.event.findUnique({ where: { id } });
        if (!existing) {
            throw new error_handler_1.AppError('Event not found', 404);
        }
        const event = await database_1.prisma.event.update({
            where: { id },
            data: {
                ...data,
                ...(data.startTime && { startTime: new Date(data.startTime) }),
                ...(data.endTime && { endTime: new Date(data.endTime) }),
            },
        });
        logger_1.logger.info(`Event updated: ${event.id}`);
        (0, response_1.sendSuccess)(res, event);
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/v1/events/:id
 * Delete an event and its analyses (cascade)
 */
async function deleteEvent(req, res, next) {
    try {
        const id = req.params.id;
        const existing = await database_1.prisma.event.findUnique({ where: { id } });
        if (!existing) {
            throw new error_handler_1.AppError('Event not found', 404);
        }
        await database_1.prisma.event.delete({ where: { id } });
        logger_1.logger.info(`Event deleted: ${id}`);
        (0, response_1.sendSuccess)(res, { message: 'Event deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=event.controller.js.map