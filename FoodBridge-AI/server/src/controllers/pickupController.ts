import { Response } from 'express';
import { PickupModel } from '../models/Pickup';
import { DonationModel } from '../models/Donation';
import { UserModel } from '../models/User';
import { NotificationModel } from '../models/Notification';
import { AuthenticatedRequest } from '../middleware/auth';
import { ActivityLogModel } from '../models/ActivityLog';

export const acceptDonation = async (req: AuthenticatedRequest, res: Response) => {
  const ngoId = req.user?.id;
  const { id: donationId } = req.params;

  if (!ngoId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const donation = await DonationModel.findById(donationId);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.status !== 'PENDING') {
      return res.status(400).json({ error: 'Donation has already been accepted or is unavailable.' });
    }

    // Update Donation
    await DonationModel.findByIdAndUpdate(donationId, {
      status: 'ACCEPTED',
      assignedNgoId: ngoId
    });

    // Create Pickup Track record
    const pickup = await PickupModel.create({
      donationId,
      ngoId,
      status: 'ASSIGNED',
      acceptedAt: new Date().toISOString()
    });

    // Notify Donor
    const ngoUser = await UserModel.findById(ngoId);
    const ngoName = ngoUser?.name || 'NGO';
    
    await NotificationModel.create({
      userId: donation.donorId,
      message: `Your food donation has been accepted by ${ngoName}. A volunteer assignment is underway.`,
      messageTa: `உங்கள் உணவு நன்கொடையை ${ngoName} தொண்டு நிறுவனம் ஏற்றுக்கொண்டது. தொண்டர் நியமிக்கப்படுகிறார்.`,
      type: 'SUCCESS',
      isRead: false
    });

    // Log Activity
    await ActivityLogModel.create({
      userId: ngoId,
      action: 'DONATION_ACCEPT',
      details: `NGO accepted donation ${donationId}`
    });

    return res.json({ success: true, pickup });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const assignVolunteer = async (req: AuthenticatedRequest, res: Response) => {
  const { id: donationId } = req.params;
  const { volunteerId } = req.body;

  try {
    const donation = await DonationModel.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found.' });

    const pickup = await PickupModel.findOne({ donationId });
    if (!pickup) return res.status(404).json({ error: 'Pickup record not found.' });

    const volunteer = await UserModel.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'VOLUNTEER') {
      return res.status(400).json({ error: 'Selected user is not a valid volunteer.' });
    }

    // Update Donation and Pickup
    await DonationModel.findByIdAndUpdate(donationId, { assignedVolunteerId: volunteerId });
    const updatedPickup = await PickupModel.findByIdAndUpdate(pickup._id || pickup.id!, {
      volunteerId,
      assignedAt: new Date().toISOString()
    });

    // Notify Volunteer
    await NotificationModel.create({
      userId: volunteerId,
      message: `New pickup assigned: Deliver ${donation.foodItems} from ${donation.orgName} to NGO.`,
      messageTa: `புதிய உணவு சேகரிப்பு பணி: ${donation.orgName}-ல் இருந்து உணவை தொண்டு நிறுவனத்திற்கு கொண்டு சேர்க்கவும்.`,
      type: 'INFO',
      isRead: false
    });

    // Notify Donor
    await NotificationModel.create({
      userId: donation.donorId,
      message: `Volunteer ${volunteer.name} has been assigned to pick up your donation.`,
      messageTa: `உங்கள் நன்கொடையை சேகரிக்க தொண்டர் ${volunteer.name} நியமிக்கப்பட்டுள்ளார்.`,
      type: 'INFO',
      isRead: false
    });

    await ActivityLogModel.create({
      userId: req.user?.id,
      action: 'VOLUNTEER_ASSIGN',
      details: `Assigned volunteer ${volunteer.name} to pickup ${pickup._id || pickup.id}`
    });

    return res.json({ success: true, pickup: updatedPickup });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePickupStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id: pickupId } = req.params;
  const { status, distance } = req.body; // status can be PICKED_UP, DELIVERED, COMPLETED

  try {
    const pickup = await PickupModel.findById(pickupId);
    if (!pickup) return res.status(404).json({ error: 'Pickup record not found.' });

    const donation = await DonationModel.findById(pickup.donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found.' });

    const updateFields: any = { status };
    const donationUpdate: any = {};

    if (status === 'PICKED_UP') {
      updateFields.pickedUpAt = new Date().toISOString();
      donationUpdate.status = 'PICKED_UP';

      // Notify NGO and Donor
      await NotificationModel.create({
        userId: donation.donorId,
        message: `Volunteer has picked up the food from your location.`,
        messageTa: `தொண்டர் உங்கள் இருப்பிடத்தில் இருந்து உணவைச் சேகரித்துக் கொண்டார்.`,
        type: 'INFO',
        isRead: false
      });
      await NotificationModel.create({
        userId: pickup.ngoId,
        message: `Volunteer is en-route with food. Estimated delivery shortly.`,
        messageTa: `தொண்டர் உணவைச் சேகரித்துக்கொண்டு உங்களை நோக்கி வருகிறார்.`,
        type: 'INFO',
        isRead: false
      });
    } 
    else if (status === 'DELIVERED') {
      updateFields.deliveredAt = new Date().toISOString();
      donationUpdate.status = 'DELIVERED';
      if (distance) updateFields.distance = Number(distance);

      // Notify NGO
      await NotificationModel.create({
        userId: pickup.ngoId,
        message: `Food has been successfully delivered to your center by volunteer. Please confirm distribution.`,
        messageTa: `உணவு உங்கள் மையத்திற்கு வெற்றிகரமாக கொண்டு வரப்பட்டது. விநியோகத்தை உறுதிப்படுத்தவும்.`,
        type: 'SUCCESS',
        isRead: false
      });
    } 
    else if (status === 'COMPLETED') {
      updateFields.completedAt = new Date().toISOString();
      donationUpdate.status = 'COMPLETED';

      // Confirming food distribution details. Increase donor reward points
      const servings = donation.servings || 10;
      const pointEarned = Math.round(servings * 0.1);
      
      const donor = await UserModel.findById(donation.donorId);
      if (donor && donor.donorProfile) {
        const newPoints = (donor.donorProfile.points || 0) + pointEarned;
        let badge: 'Bronze' | 'Silver' | 'Gold' | 'Food Hero' = 'Bronze';
        
        if (newPoints >= 500) badge = 'Food Hero';
        else if (newPoints >= 250) badge = 'Gold';
        else if (newPoints >= 100) badge = 'Silver';

        await UserModel.findByIdAndUpdate(donation.donorId, {
          donorProfile: {
            ...donor.donorProfile,
            points: newPoints,
            badge
          }
        });

        // Notify Donor with points
        await NotificationModel.create({
          userId: donation.donorId,
          message: `Distribution Complete! You earned ${pointEarned} points. Current Badge: ${badge}.`,
          messageTa: `உணவு விநியோகம் முடிந்தது! நீங்கள் ${pointEarned} புள்ளிகளைப் பெற்றுள்ளீர்கள். முத்திரை: ${badge}.`,
          type: 'SUCCESS',
          isRead: false
        });
      }

      // Update volunteer records
      if (pickup.volunteerId) {
        const volunteer = await UserModel.findById(pickup.volunteerId);
        if (volunteer && volunteer.volunteerProfile) {
          const totalDist = (volunteer.volunteerProfile.distanceTravelled || 0) + (pickup.distance || 5);
          const totalMeals = (volunteer.volunteerProfile.mealsTransported || 0) + servings;
          
          await UserModel.findByIdAndUpdate(pickup.volunteerId, {
            volunteerProfile: {
              ...volunteer.volunteerProfile,
              distanceTravelled: totalDist,
              mealsTransported: totalMeals
            }
          });
        }
      }
    }

    const updatedPickup = await PickupModel.findByIdAndUpdate(pickupId, updateFields);
    await DonationModel.findByIdAndUpdate(pickup.donationId, donationUpdate);

    await ActivityLogModel.create({
      userId: req.user?.id,
      action: `PICKUP_STATUS_${status}`,
      details: `Updated pickup ${pickupId} status to ${status}`
    });

    return res.json({ success: true, pickup: updatedPickup });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPickups = async (req: AuthenticatedRequest, res: Response) => {
  const { role, id } = req.user!;
  try {
    const filter: any = {};
    if (role === 'NGO') filter.ngoId = id;
    else if (role === 'VOLUNTEER') filter.volunteerId = id;

    const pickups = await PickupModel.find(filter);
    
    // Enhance with donation information
    const enhancedPickups = [];
    for (const p of pickups) {
      const donation = await DonationModel.findById(p.donationId);
      if (donation) {
        enhancedPickups.push({
          ...p,
          id: p._id || p.id,
          donation
        });
      }
    }
    return res.json(enhancedPickups);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
