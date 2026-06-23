import { Request, Response, NextFunction } from 'express';
/**
 * POST /api/v1/events
 * Create a new event
 */
export declare function createEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/v1/events
 * List all events with pagination and filters
 */
export declare function getEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/v1/events/:id
 * Get a single event by ID with its analyses
 */
export declare function getEventById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/v1/events/:id
 * Update an event
 */
export declare function updateEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/v1/events/:id
 * Delete an event and its analyses (cascade)
 */
export declare function deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=event.controller.d.ts.map