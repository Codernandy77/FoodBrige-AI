import mongoose, { Schema, Document } from 'mongoose';
import { isMongoDB } from '../config/db';
import { DBStore } from './dbStore';

export interface INotification {
  _id?: string;
  id?: string;
  userId: string; // Target user
  message: string;
  messageTa?: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  isRead: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const NotificationSchema = new Schema<INotification & Document>({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  messageTa: String,
  type: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'DANGER'], default: 'INFO' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const NotificationMongoose = mongoose.model<INotification & Document>('Notification', NotificationSchema);
const NotificationJSON = new DBStore<INotification>('notifications');

export const NotificationModel = {
  find: async (filter?: any) => {
    if (isMongoDB) return NotificationMongoose.find(filter);
    const list = await NotificationJSON.find(filter);
    return list.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  },
  create: async (data: Omit<INotification, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    if (isMongoDB) return NotificationMongoose.create(data);
    return NotificationJSON.create(data);
  },
  findByIdAndUpdate: async (id: string, update: any) => {
    if (isMongoDB) return NotificationMongoose.findByIdAndUpdate(id, update, { new: true });
    return NotificationJSON.findByIdAndUpdate(id, update);
  },
  clear: async () => {
    if (isMongoDB) await NotificationMongoose.deleteMany({});
    else await NotificationJSON.clear();
  }
};
