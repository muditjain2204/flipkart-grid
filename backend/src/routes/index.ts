import { Router } from 'express';
import eventRoutes from './event.routes';
import analysisRoutes from './analysis.routes';
import trafficRoutes from './traffic.routes';
import reportRoutes from './report.routes';
import incidentRoutes from './incidents.routes';

const router = Router();

router.use('/events', eventRoutes);
router.use('/analysis', analysisRoutes);
router.use('/traffic', trafficRoutes);
router.use('/reports', reportRoutes);
router.use('/incidents', incidentRoutes);

export default router;
