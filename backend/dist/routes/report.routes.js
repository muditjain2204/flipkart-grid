"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../middleware/validator");
const analysis_schema_1 = require("../schemas/analysis.schema");
const report_controller_1 = require("../controllers/report.controller");
const router = (0, express_1.Router)();
router.get('/', (0, validator_1.validate)({ query: analysis_schema_1.ListReportsQuerySchema }), report_controller_1.getReports);
router.get('/:id', (0, validator_1.validate)({ params: analysis_schema_1.AnalysisParamsSchema }), report_controller_1.getReportById);
exports.default = router;
//# sourceMappingURL=report.routes.js.map