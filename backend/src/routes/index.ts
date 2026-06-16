import { Router } from 'express';
import eventRoutes from './event.routes';
import analysisRoutes from './analysis.routes';
import trafficRoutes from './traffic.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/events', eventRoutes);
router.use('/analysis', analysisRoutes);
router.use('/traffic', trafficRoutes);
router.use('/reports', reportRoutes);

export default router;
