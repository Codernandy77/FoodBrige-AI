import mongoose, { Schema, Document } from 'mongoose';
import { isMongoDB } from '../config/db';
import { DBStore } from './dbStore';

export interface IPickup {
  _id?: string;
  id?: string;
  donationId: string;
  ngoId: string;
  volunteerId?: string;
  distance?: number;
  status: 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED';
  acceptedAt?: string | Date;
  assignedAt?: string | Date;
  pickedUpAt?: string | Date;
  deliveredAt?: string | Date;
  completedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const PickupSchema = new Schema<IPickup & Document>({
  donationId: { type: String, required: true },
  ngoId: { type: String, required: true },
  volunteerId: String,
  distance: Number,
  status: { type: String, enum: ['ASSIGNED', 'PICKED_UP', 'DELIVERED', 'COMPLETED'], default: 'ASSIGNED' },
  acceptedAt: { type: Date, default: Date.now },
  assignedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  completedAt: Date
}, { timestamps: true });

const PickupMongoose = mongoose.model<IPickup & Document>('Pickup', PickupSchema);
const PickupJSON = new DBStore<IPickup>('pickups');

export const PickupModel = {
  find: async (filter?: any) => {
    if (isMongoDB) return PickupMongoose.find(filter);
    return PickupJSON.find(filter);
  },
  findOne: async (filter: any) => {
    if (isMongoDB) return PickupMongoose.findOne(filter);
    return PickupJSON.findOne(filter);
  },
  findById: async (id: string) => {
    if (isMongoDB) return PickupMongoose.findById(id);
    return PickupJSON.findById(id);
  },
  create: async (data: Omit<IPickup, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    if (isMongoDB) return PickupMongoose.create(data);
    return PickupJSON.create(data);
  },
  findByIdAndUpdate: async (id: string, update: any) => {
    if (isMongoDB) return PickupMongoose.findByIdAndUpdate(id, update, { new: true });
    return PickupJSON.findByIdAndUpdate(id, update);
  },
  findByIdAndDelete: async (id: string) => {
    if (isMongoDB) return PickupMongoose.findByIdAndDelete(id);
    return PickupJSON.findByIdAndDelete(id);
  },
  clear: async () => {
    if (isMongoDB) await PickupMongoose.deleteMany({});
    else await PickupJSON.clear();
  }
};
