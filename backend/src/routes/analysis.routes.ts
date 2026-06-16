import { Router } from 'express';
import { validate } from '../middleware/validator';
import { RunAnalysisSchema, AnalysisParamsSchema } from '../schemas/analysis.schema';
import {
  runAnalysis,
  getAnalysisStatus,
  getAnalysisResult,
} from '../controllers/analysis.controller';

const router = Router();

router.post(
  '/run',
  validate({ body: RunAnalysisSchema }),
  runAnalysis
);

router.get(
  '/:id/status',
  validate({ params: AnalysisParamsSchema }),
  getAnalysisStatus
);

router.get(
  '/:id/result',
  validate({ params: AnalysisParamsSchema }),
  getAnalysisResult
);

export default router;
