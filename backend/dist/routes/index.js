"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_routes_1 = __importDefault(require("./event.routes"));
const analysis_routes_1 = __importDefault(require("./analysis.routes"));
const traffic_routes_1 = __importDefault(require("./traffic.routes"));
const report_routes_1 = __importDefault(require("./report.routes"));
const incidents_routes_1 = __importDefault(require("./incidents.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const system_routes_1 = __importDefault(require("./system.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/events', event_routes_1.default);
router.use('/analysis', analysis_routes_1.default);
router.use('/traffic', traffic_routes_1.default);
router.use('/reports', report_routes_1.default);
router.use('/incidents', incidents_routes_1.default);
router.use('/system', system_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map