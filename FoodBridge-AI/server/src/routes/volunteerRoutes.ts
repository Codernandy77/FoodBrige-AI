import { Router } from 'express';
import { getVolunteerPickups } from '../controllers/volunteerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['VOLUNTEER', 'ADMIN']));

router.get('/pickups', getVolunteerPickups);

export default router;
