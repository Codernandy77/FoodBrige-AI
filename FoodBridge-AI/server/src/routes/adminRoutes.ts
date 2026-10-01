import { Router } from 'express';
import { getUsers, verifyUser, toggleSuspendUser, getSystemLogs, getAdminStats } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/users', getUsers);
router.post('/verify-user', verifyUser);
router.post('/suspend-user', toggleSuspendUser);
router.get('/logs', getSystemLogs);
router.get('/stats', getAdminStats);

export default router;
