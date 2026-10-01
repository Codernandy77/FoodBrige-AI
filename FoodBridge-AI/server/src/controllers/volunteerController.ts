import { Response } from 'express';
import { PickupModel } from '../models/Pickup';
import { DonationModel } from '../models/Donation';
import { AuthenticatedRequest } from '../middleware/auth';

export const getVolunteerPickups = async (req: AuthenticatedRequest, res: Response) => {
  const volunteerId = req.user?.id;
  if (!volunteerId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const pickups = await PickupModel.find({ volunteerId });
    const enhancedPickups = [];

    for (const p of pickups) {
      const donation = await DonationModel.findById(p.donationId);
      if (donation) {
        enhancedPickups.push({
          ...p,
          donation
        });
      }
    }

    return res.json(enhancedPickups);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
