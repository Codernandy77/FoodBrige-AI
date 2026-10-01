import mongoose, { Schema, Document } from 'mongoose';
import { isMongoDB } from '../config/db';
import { DBStore } from './dbStore';

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';
  isVerified: boolean;
  phone: string;
  address: string;
  donorProfile?: {
    orgName: string;
    donorType: string;
    points: number;
    badge: 'Bronze' | 'Silver' | 'Gold' | 'Food Hero';
  };
  ngoProfile?: {
    capacity: number;
    regNumber: string;
    documentUrl?: string;
  };
  volunteerProfile?: {
    availability: boolean;
    vehicleType?: string;
    distanceTravelled: number;
    mealsTransported: number;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Mongoose Schema
const UserSchema = new Schema<IUser & Document>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'], required: true },
  isVerified: { type: Boolean, default: false },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  donorProfile: {
    orgName: String,
    donorType: String,
    points: { type: Number, default: 0 },
    badge: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Food Hero'], default: 'Bronze' }
  },
  ngoProfile: {
    capacity: Number,
    regNumber: String,
    documentUrl: String
  },
  volunteerProfile: {
    availability: { type: Boolean, default: true },
    vehicleType: String,
    distanceTravelled: { type: Number, default: 0 },
    mealsTransported: { type: Number, default: 0 }
  }
}, { timestamps: true });

const UserMongoose = mongoose.model<IUser & Document>('User', UserSchema);
const UserJSON = new DBStore<IUser>('users');

export const UserModel = {
  find: async (filter?: any) => {
    if (isMongoDB) return UserMongoose.find(filter);
    return UserJSON.find(filter);
  },
  findOne: async (filter: any) => {
    if (isMongoDB) return UserMongoose.findOne(filter);
    return UserJSON.findOne(filter);
  },
  findById: async (id: string) => {
    if (isMongoDB) return UserMongoose.findById(id);
    return UserJSON.findById(id);
  },
  create: async (data: Omit<IUser, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    if (isMongoDB) return UserMongoose.create(data);
    return UserJSON.create(data);
  },
  findByIdAndUpdate: async (id: string, update: any) => {
    if (isMongoDB) return UserMongoose.findByIdAndUpdate(id, update, { new: true });
    return UserJSON.findByIdAndUpdate(id, update);
  },
  findByIdAndDelete: async (id: string) => {
    if (isMongoDB) return UserMongoose.findByIdAndDelete(id);
    return UserJSON.findByIdAndDelete(id);
  },
  countDocuments: async (filter?: any) => {
    if (isMongoDB) return UserMongoose.countDocuments(filter);
    return UserJSON.count(filter);
  },
  clear: async () => {
    if (isMongoDB) await UserMongoose.deleteMany({});
    else await UserJSON.clear();
  }
};
