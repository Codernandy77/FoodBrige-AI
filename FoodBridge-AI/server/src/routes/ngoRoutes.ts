import { Router } from 'express';
import { getNearbyDonations, getAvailableVolunteers } from '../controllers/ngoController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['NGO', 'ADMIN']));

router.get('/nearby', getNearbyDonations);
router.get('/volunteers/available', getAvailableVolunteers);

export default router;
