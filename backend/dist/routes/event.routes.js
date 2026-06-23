"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../middleware/validator");
const event_schema_1 = require("../schemas/event.schema");
const event_controller_1 = require("../controllers/event.controller");
const router = (0, express_1.Router)();
router.post('/', (0, validator_1.validate)({ body: event_schema_1.CreateEventSchema }), event_controller_1.createEvent);
router.get('/', (0, validator_1.validate)({ query: event_schema_1.ListEventsQuerySchema }), event_controller_1.getEvents);
router.get('/:id', (0, validator_1.validate)({ params: event_schema_1.EventParamsSchema }), event_controller_1.getEventById);
router.put('/:id', (0, validator_1.validate)({ params: event_schema_1.EventParamsSchema, body: event_schema_1.UpdateEventSchema }), event_controller_1.updateEvent);
router.delete('/:id', (0, validator_1.validate)({ params: event_schema_1.EventParamsSchema }), event_controller_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=event.routes.js.map