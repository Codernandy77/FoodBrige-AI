import { Response } from 'express';
import { UserModel } from '../models/User';
import { DonationModel } from '../models/Donation';
import { AuthenticatedRequest } from '../middleware/auth';

// Fetch nearby available donations that are PENDING
export const getNearbyDonations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Return all PENDING donations
    const donations = await DonationModel.find({ status: 'PENDING' });
    return res.json(donations);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Fetch volunteers that are registered and available
export const getAvailableVolunteers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const volunteers = await UserModel.find({
      role: 'VOLUNTEER',
      isVerified: true,
      'volunteerProfile.availability': true
    });
    return res.json(volunteers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
