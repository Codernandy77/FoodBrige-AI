import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'foodbridge_secret_key_12345';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';
    name: string;
    isVerified: boolean;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: any; name: string };
    
    // Fetch fresh user data from database to check verification/status
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ error: 'User no longer exists' });
    }

    req.user = {
      id: user._id || user.id!,
      email: user.email,
      role: user.role,
      name: user.name,
      isVerified: user.isVerified,
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: Array<'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: Requires one of these roles: ${roles.join(', ')}` });
    }
    
    next();
  };
};

export const requireVerified = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Admins are auto-verified
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ error: 'Verification pending. Access restricted until approved by Administrator.' });
  }

  next();
};
