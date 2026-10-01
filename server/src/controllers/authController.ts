import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { ActivityLogModel } from '../models/ActivityLog';

const JWT_SECRET = process.env.JWT_SECRET || 'foodbridge_secret_key_12345';

export const register = async (req: any, res: Response) => {
  const { name, email, password, phone, address, role, profileData } = req.body;

  try {
    if (!name || !email || !password || !phone || !address || !role) {
      return res.status(400).json({ error: 'All primary fields are required.' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Default verification statuses
    // Admins are auto-verified, Donors/Volunteers/NGOs require admin approval
    // But for a smooth hackathon/demo experience, we'll auto-verify Donors & Volunteers, 
    // and keep NGO verification pending so the user can test the admin approval flow!
    const isVerified = (role === 'ADMIN' || role === 'DONOR' || role === 'VOLUNTEER');

    const userData: any = {
      name,
      email,
      passwordHash,
      phone,
      address,
      role,
      isVerified
    };

    if (role === 'DONOR') {
      userData.donorProfile = {
        orgName: profileData?.orgName || name,
        donorType: profileData?.donorType || 'HOTEL',
        points: 0,
        badge: 'Bronze'
      };
    } else if (role === 'NGO') {
      userData.ngoProfile = {
        capacity: Number(profileData?.capacity) || 100,
        regNumber: profileData?.regNumber || 'REG-PENDING',
        documentUrl: profileData?.documentUrl || ''
      };
    } else if (role === 'VOLUNTEER') {
      userData.volunteerProfile = {
        availability: true,
        vehicleType: profileData?.vehicleType || 'TWO_WHEELER',
        distanceTravelled: 0,
        mealsTransported: 0
      };
    }

    const user = await UserModel.create(userData);

    await ActivityLogModel.create({
      userId: user._id || user.id,
      action: 'USER_REGISTER',
      details: `User registered with email ${email} and role ${role}`
    });

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        address: user.address,
        donorProfile: user.donorProfile,
        ngoProfile: user.ngoProfile,
        volunteerProfile: user.volunteerProfile
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const login = async (req: any, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    await ActivityLogModel.create({
      userId: user._id || user.id,
      action: 'USER_LOGIN',
      details: `User logged in: ${email}`
    });

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        address: user.address,
        donorProfile: user.donorProfile,
        ngoProfile: user.ngoProfile,
        volunteerProfile: user.volunteerProfile
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      address: user.address,
      donorProfile: user.donorProfile,
      ngoProfile: user.ngoProfile,
      volunteerProfile: user.volunteerProfile
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
