import { Router } from 'express';
import { createDonation, getDonations, getDonationById, updateDonation, deleteDonation } from '../controllers/donationController';
import { acceptDonation, assignVolunteer } from '../controllers/pickupController';
import { authenticateToken, requireRole, requireVerified } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Create, read, update, delete donations
router.post('/', requireRole(['DONOR', 'ADMIN']), createDonation);
router.get('/', getDonations);
router.get('/:id', getDonationById);
router.put('/:id', updateDonation);
router.delete('/:id', deleteDonation);

// NGO accepting donation and assigning volunteer
router.post('/:id/accept', requireRole(['NGO', 'ADMIN']), requireVerified, acceptDonation);
router.post('/:id/assign-volunteer', requireRole(['NGO', 'ADMIN']), requireVerified, assignVolunteer);

export default router;
