import { Response } from 'express';
import { DonationModel, IDonation } from '../models/Donation';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateSafetyAndPriority } from '../services/safetyCalculator';
import { NotificationModel } from '../models/Notification';
import { UserModel } from '../models/User';
import { ActivityLogModel } from '../models/ActivityLog';

export const createDonation = async (req: AuthenticatedRequest, res: Response) => {
  const donor = req.user;
  if (!donor) return res.status(401).json({ error: 'Unauthorized' });

  const {
    category,
    foodItems,
    foodType,
    quantity,
    servings,
    cookingDate,
    cookingTime,
    storageCondition,
    isExposed,
    isReheated,
    temperature,
    pickupDeadline,
    address,
    latitude,
    longitude,
    contactNumber,
    specialInstructions,
    foodImage
  } = req.body;

  try {
    if (!category || !foodItems || !foodType || !quantity || !servings || !cookingDate || !cookingTime || !storageCondition || !pickupDeadline || !address) {
      return res.status(400).json({ error: 'All food and pickup details are required.' });
    }

    // Perform Safety Assessment & Priority Score calculation
    const safetyReport = calculateSafetyAndPriority({
      category,
      cookingDate,
      cookingTime,
      storageCondition,
      isExposed: !!isExposed,
      isReheated: !!isReheated,
      temperature: temperature !== undefined ? Number(temperature) : undefined,
      pickupDeadline
    });

    const userProfile = await UserModel.findById(donor.id);
    const orgName = userProfile?.donorProfile?.orgName || donor.name;

    const donationData: Omit<IDonation, 'id' | '_id' | 'createdAt' | 'updatedAt'> = {
      donorId: donor.id,
      donorName: donor.name,
      orgName,
      category,
      foodItems,
      foodType,
      quantity,
      servings: Number(servings),
      cookingDate,
      cookingTime,
      storageCondition,
      isExposed: !!isExposed,
      isReheated: !!isReheated,
      temperature: temperature !== undefined ? Number(temperature) : undefined,
      pickupDeadline,
      address,
      latitude: Number(latitude) || 13.0827,
      longitude: Number(longitude) || 80.2707,
      contactNumber,
      specialInstructions,
      foodImage: foodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      priorityScore: safetyReport.priorityScore,
      safetyStatus: safetyReport.safetyStatus,
      status: 'PENDING'
    };

    const donation = await DonationModel.create(donationData);

    // Activity Log
    await ActivityLogModel.create({
      userId: donor.id,
      action: 'DONATION_CREATE',
      details: `Created food donation (${category}) with ID ${donation._id || donation.id}`
    });

    // Notify NGOs nearby
    const ngos = await UserModel.find({ role: 'NGO', isVerified: true });
    for (const ngo of ngos) {
      await NotificationModel.create({
        userId: (ngo._id || ngo.id) as string,
        message: `New surplus food donation (${category}) available in ${address}.`,
        messageTa: `அருகிலுள்ள ${address} பகுதியில் புதிய உபரி உணவு நன்கொடை (${category}) கிடைக்கிறது.`,
        type: 'INFO',
        isRead: false
      });
    }

    return res.status(201).json({
      donation,
      safetyReport
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getDonations = async (req: AuthenticatedRequest, res: Response) => {
  const { status, category, foodType, search, safetyStatus } = req.query;

  try {
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (foodType) filter.foodType = foodType;
    if (safetyStatus) filter.safetyStatus = safetyStatus;

    let donations = await DonationModel.find(filter);

    // If search term is present
    if (search) {
      const q = String(search).toLowerCase();
      donations = donations.filter(d => 
        d.foodItems.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q) ||
        d.orgName.toLowerCase().includes(q)
      );
    }

    return res.json(donations);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getDonationById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const donation = await DonationModel.findById(id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found.' });
    }
    return res.json(donation);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateDonation = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const donation = await DonationModel.findById(id);
    if (!donation) return res.status(404).json({ error: 'Donation not found.' });

    // Restrict editing only to pending donations or authorized admins
    if (donation.donorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update this donation.' });
    }

    const updated = await DonationModel.findByIdAndUpdate(id, req.body);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteDonation = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const donation = await DonationModel.findById(id);
    if (!donation) return res.status(404).json({ error: 'Donation not found.' });

    if (donation.donorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this donation.' });
    }

    await DonationModel.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Donation deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
