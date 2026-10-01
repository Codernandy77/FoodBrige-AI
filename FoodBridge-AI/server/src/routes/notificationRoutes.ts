import { Router, Response } from 'express';
import { NotificationModel } from '../models/Notification';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Fetch notifications for active user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const list = await NotificationModel.find({ userId });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await NotificationModel.findByIdAndUpdate(id, { isRead: true });
    return res.json({ success: true, notification: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
