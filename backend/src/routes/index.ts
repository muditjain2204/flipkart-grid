import { Router } from 'express';
import eventRoutes from './event.routes';
import analysisRoutes from './analysis.routes';
import trafficRoutes from './traffic.routes';
import reportRoutes from './report.routes';
import incidentRoutes from './incidents.routes';
import authRoutes from './auth.routes';
import systemRoutes from './system.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/analysis', analysisRoutes);
router.use('/traffic', trafficRoutes);
router.use('/reports', reportRoutes);
router.use('/incidents', incidentRoutes);
router.use('/system', systemRoutes);

export default router;
