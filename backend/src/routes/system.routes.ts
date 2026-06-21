import { Router, Request, Response, NextFunction } from 'express';
import { seedDatabase } from '../services/seeder.service';
import { sendSuccess } from '../utils/response';

const router = Router();

/**
 * POST /api/v1/system/seed
 * Seed the database with all events and Astram CSV incidents.
 */
router.post('/seed', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await seedDatabase();
    sendSuccess(res, {
      message: 'Database seeded and reset successfully!',
      ...result
    }, 200);
  } catch (error) {
    next(error);
  }
});

export default router;
