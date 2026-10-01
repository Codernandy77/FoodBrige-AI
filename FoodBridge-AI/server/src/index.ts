import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Check/connect database (Mongoose with file fallback)
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 FoodBridge AI Server successfully listening on http://localhost:${PORT}`);
    console.log(`📡 Health Check endpoint available at http://localhost:${PORT}/api/health`);
    console.log(`👉 Press CTRL+C to terminate the process\n`);
  });
};

startServer().catch((error) => {
  console.error('[Startup Error] Failed to boot backend server:', error);
  process.exit(1);
});
