import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export let isMongoDB = false;

export const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodbridge';
  
  console.log(`[Database] Attempting to connect to MongoDB at ${mongoUri}...`);
  
  try {
    // Attempt connection with a short 2-second timeout to avoid blocking server boot
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    
    isMongoDB = true;
    console.log('[Database] MongoDB connected successfully! Running in production-grade DB mode.');
    return true;
  } catch (error: any) {
    isMongoDB = false;
    console.warn('\n========================================================================');
    console.warn('[Database] WARNING: Could not connect to MongoDB database.');
    console.warn(`[Database] Error detail: ${error.message}`);
    console.warn('[Database] Falling back to LOCAL PERSISTENT JSON STORAGE MODE.');
    console.warn('[Database] The application will work 100% locally using auto-created JSON stores.');
    console.warn('========================================================================\n');
    return false;
  }
};
