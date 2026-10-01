import { Router } from 'express';
import { createNeedReport, getNeedReports } from '../controllers/needReportController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createNeedReport);
router.get('/', getNeedReports);

export default router;
