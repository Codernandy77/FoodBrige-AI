import mongoose, { Schema, Document } from 'mongoose';
import { isMongoDB } from '../config/db';
import { DBStore } from './dbStore';

export interface IActivityLog {
  _id?: string;
  id?: string;
  userId?: string;
  action: string;
  details: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const ActivityLogSchema = new Schema<IActivityLog & Document>({
  userId: String,
  action: { type: String, required: true },
  details: { type: String, required: true }
}, { timestamps: true });

const ActivityLogMongoose = mongoose.model<IActivityLog & Document>('ActivityLog', ActivityLogSchema);
const ActivityLogJSON = new DBStore<IActivityLog>('activityLogs');

export const ActivityLogModel = {
  find: async (filter?: any) => {
    if (isMongoDB) return ActivityLogMongoose.find(filter);
    const list = await ActivityLogJSON.find(filter);
    return list.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  },
  create: async (data: Omit<IActivityLog, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    if (isMongoDB) return ActivityLogMongoose.create(data);
    return ActivityLogJSON.create(data);
  },
  clear: async () => {
    if (isMongoDB) await ActivityLogMongoose.deleteMany({});
    else await ActivityLogJSON.clear();
  }
};
export default ActivityLogModel;
