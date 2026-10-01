import { Router } from 'express';
import { getImpactStats } from '../controllers/impactController';

const router = Router();

// Impact stats are public to showcase dashboard transparency
router.get('/', getImpactStats);

export default router;
