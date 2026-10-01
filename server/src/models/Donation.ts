import mongoose, { Schema, Document } from 'mongoose';
import { isMongoDB } from '../config/db';
import { DBStore } from './dbStore';

export interface IDonation {
  _id?: string;
  id?: string;
  donorId: string;
  donorName: string;
  orgName: string;
  category: string;
  foodItems: string;
  foodType: 'VEG' | 'NON_VEG';
  quantity: string;
  servings: number;
  cookingDate: string;
  cookingTime: string;
  storageCondition: 'AMBIENT' | 'REFRIGERATED' | 'HOT_HOLDING';
  isExposed: boolean;
  isReheated: boolean;
  temperature?: number;
  pickupDeadline: string;
  address: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  specialInstructions?: string;
  foodImage?: string;
  priorityScore: number;
  safetyStatus: 'SAFE' | 'CAUTION' | 'URGENT REVIEW' | 'DO NOT DISTRIBUTE';
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  assignedNgoId?: string;
  assignedVolunteerId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const DonationSchema = new Schema<IDonation & Document>({
  donorId: { type: String, required: true },
  donorName: { type: String, required: true },
  orgName: { type: String, required: true },
  category: { type: String, required: true },
  foodItems: { type: String, required: true },
  foodType: { type: String, enum: ['VEG', 'NON_VEG'], required: true },
  quantity: { type: String, required: true },
  servings: { type: Number, required: true },
  cookingDate: { type: String, required: true },
  cookingTime: { type: String, required: true },
  storageCondition: { type: String, enum: ['AMBIENT', 'REFRIGERATED', 'HOT_HOLDING'], required: true },
  isExposed: { type: Boolean, default: false },
  isReheated: { type: Boolean, default: false },
  temperature: Number,
  pickupDeadline: { type: String, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  contactNumber: { type: String, required: true },
  specialInstructions: String,
  foodImage: String,
  priorityScore: { type: Number, default: 0 },
  safetyStatus: { type: String, enum: ['SAFE', 'CAUTION', 'URGENT REVIEW', 'DO NOT DISTRIBUTE'], required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  assignedNgoId: String,
  assignedVolunteerId: String
}, { timestamps: true });

const DonationMongoose = mongoose.model<IDonation & Document>('Donation', DonationSchema);
const DonationJSON = new DBStore<IDonation>('donations');

export const DonationModel = {
  find: async (filter?: any) => {
    if (isMongoDB) return DonationMongoose.find(filter);
    // Sort JSON stores by createdAt descending
    const items = await DonationJSON.find(filter);
    return items.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  },
  findOne: async (filter: any) => {
    if (isMongoDB) return DonationMongoose.findOne(filter);
    return DonationJSON.findOne(filter);
  },
  findById: async (id: string) => {
    if (isMongoDB) return DonationMongoose.findById(id);
    return DonationJSON.findById(id);
  },
  create: async (data: Omit<IDonation, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    if (isMongoDB) return DonationMongoose.create(data);
    return DonationJSON.create(data);
  },
  findByIdAndUpdate: async (id: string, update: any) => {
    if (isMongoDB) return DonationMongoose.findByIdAndUpdate(id, update, { new: true });
    return DonationJSON.findByIdAndUpdate(id, update);
  },
  findByIdAndDelete: async (id: string) => {
    if (isMongoDB) return DonationMongoose.findByIdAndDelete(id);
    return DonationJSON.findByIdAndDelete(id);
  },
  countDocuments: async (filter?: any) => {
    if (isMongoDB) return DonationMongoose.countDocuments(filter);
    return DonationJSON.count(filter);
  },
  clear: async () => {
    if (isMongoDB) await DonationMongoose.deleteMany({});
    else await DonationJSON.clear();
  }
};
