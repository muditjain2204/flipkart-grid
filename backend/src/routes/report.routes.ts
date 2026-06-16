import { Router } from 'express';
import { validate } from '../middleware/validator';
import { AnalysisParamsSchema, ListReportsQuerySchema } from '../schemas/analysis.schema';
import { getReports, getReportById } from '../controllers/report.controller';

const router = Router();

router.get(
  '/',
  validate({ query: ListReportsQuerySchema }),
  getReports
);

router.get(
  '/:id',
  validate({ params: AnalysisParamsSchema }),
  getReportById
);

export default router;
