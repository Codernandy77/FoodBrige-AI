import { Router } from 'express';
import { getPickups, updatePickupStatus } from '../controllers/pickupController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getPickups);
router.put('/:id/status', updatePickupStatus);

export default router;
