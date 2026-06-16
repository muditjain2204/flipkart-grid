import { Router } from 'express';
import { validate } from '../middleware/validator';
import {
  CreateEventSchema,
  UpdateEventSchema,
  EventParamsSchema,
  ListEventsQuerySchema,
} from '../schemas/event.schema';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';

const router = Router();

router.post(
  '/',
  validate({ body: CreateEventSchema }),
  createEvent
);

router.get(
  '/',
  validate({ query: ListEventsQuerySchema }),
  getEvents
);

router.get(
  '/:id',
  validate({ params: EventParamsSchema }),
  getEventById
);

router.put(
  '/:id',
  validate({ params: EventParamsSchema, body: UpdateEventSchema }),
  updateEvent
);

router.delete(
  '/:id',
  validate({ params: EventParamsSchema }),
  deleteEvent
);

export default router;
