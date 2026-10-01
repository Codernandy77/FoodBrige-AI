import mongoose, { Schema, Document } from 'mongoose';
import { isMongoDB } from '../config/db';
import { DBStore } from './dbStore';

export interface INeedReport {
  _id?: string;
  id?: string;
  userId: string;
  reporterName: string;
  areaName: string;
  needLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  servingsNeeded: number;
  latitude: number;
  longitude: number;
  details?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const NeedReportSchema = new Schema<INeedReport & Document>({
  userId: { type: String, required: true },
  reporterName: { type: String, required: true },
  areaName: { type: String, required: true },
  needLevel: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], required: true },
  servingsNeeded: { type: Number, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  details: String
}, { timestamps: true });

const NeedReportMongoose = mongoose.model<INeedReport & Document>('NeedReport', NeedReportSchema);
const NeedReportJSON = new DBStore<INeedReport>('needReports');

export const NeedReportModel = {
  find: async (filter?: any) => {
    if (isMongoDB) return NeedReportMongoose.find(filter);
    return NeedReportJSON.find(filter);
  },
  create: async (data: Omit<INeedReport, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
    if (isMongoDB) return NeedReportMongoose.create(data);
    return NeedReportJSON.create(data);
  },
  clear: async () => {
    if (isMongoDB) await NeedReportMongoose.deleteMany({});
    else await NeedReportJSON.clear();
  }
};
