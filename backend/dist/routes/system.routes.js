"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seeder_service_1 = require("../services/seeder.service");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
/**
 * POST /api/v1/system/seed
 * Seed the database with all events and Astram CSV incidents.
 */
router.post('/seed', async (req, res, next) => {
    try {
        const result = await (0, seeder_service_1.seedDatabase)();
        (0, response_1.sendSuccess)(res, {
            message: 'Database seeded and reset successfully!',
            ...result
        }, 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=system.routes.js.map