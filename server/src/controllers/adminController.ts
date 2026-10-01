import { Response } from 'express';
import { UserModel } from '../models/User';
import { DonationModel } from '../models/Donation';
import { PickupModel } from '../models/Pickup';
import { ActivityLogModel } from '../models/ActivityLog';
import { AuthenticatedRequest } from '../middleware/auth';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await UserModel.find({});
    // Remove passwords before returning
    const safeUsers = users.map((u: any) => {
      const { passwordHash, ...rest } = u._doc || u;
      return rest;
    });
    return res.json(safeUsers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const verifyUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const updated = await UserModel.findByIdAndUpdate(userId, { isVerified: true });
    
    await ActivityLogModel.create({
      userId: req.user?.id,
      action: 'USER_VERIFY',
      details: `Approved verification request for user ${user.email} (${user.role})`
    });

    return res.json({ success: true, user: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const toggleSuspendUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Toggle verification as a suspension mechanism in demo, or just delete the user
    // Let's delete user or toggle verification. Let's toggle verification status!
    const isSuspended = user.isVerified;
    const updated = await UserModel.findByIdAndUpdate(userId, { isVerified: !isSuspended });

    await ActivityLogModel.create({
      userId: req.user?.id,
      action: isSuspended ? 'USER_SUSPEND' : 'USER_UNSUSPEND',
      details: `${isSuspended ? 'Suspended' : 'Activated'} user ${user.email}`
    });

    return res.json({ success: true, user: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getSystemLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await ActivityLogModel.find({});
    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAdminStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await UserModel.countDocuments({});
    const totalDonors = await UserModel.countDocuments({ role: 'DONOR' });
    const verifiedNgos = await UserModel.countDocuments({ role: 'NGO', isVerified: true });
    const pendingNgos = await UserModel.countDocuments({ role: 'NGO', isVerified: false });
    const totalVolunteers = await UserModel.countDocuments({ role: 'VOLUNTEER' });
    const activeDonations = await DonationModel.countDocuments({ status: { $ne: 'COMPLETED' } });
    const completedDonations = await DonationModel.countDocuments({ status: 'COMPLETED' });

    return res.json({
      totalUsers,
      totalDonors,
      verifiedNgos,
      pendingNgos,
      totalVolunteers,
      activeDonations,
      completedDonations
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
