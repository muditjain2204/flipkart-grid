"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../middleware/validator");
const analysis_schema_1 = require("../schemas/analysis.schema");
const analysis_controller_1 = require("../controllers/analysis.controller");
const router = (0, express_1.Router)();
router.post('/run', (0, validator_1.validate)({ body: analysis_schema_1.RunAnalysisSchema }), analysis_controller_1.runAnalysis);
router.get('/:id/status', (0, validator_1.validate)({ params: analysis_schema_1.AnalysisParamsSchema }), analysis_controller_1.getAnalysisStatus);
router.get('/:id/result', (0, validator_1.validate)({ params: analysis_schema_1.AnalysisParamsSchema }), analysis_controller_1.getAnalysisResult);
exports.default = router;
//# sourceMappingURL=analysis.routes.js.map