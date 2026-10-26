import 'dotenv/config';
import mongoose from 'mongoose';

const checkConnection = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB Check] MONGODB_URI is not set in server/.env');
    process.exit(1);
  }

  // Mask credentials for display
  const maskedUri = uri.replace(/\/\/[^@]+@/, '//***:***@');
  console.log(`[DB Check] Attempting connection to: ${maskedUri}`);

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'findora',
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[DB Check] SUCCESS: Connected to MongoDB host: ${conn.connection.host}`);
    console.log(`[DB Check] Target Database: "${conn.connection.name}"`);
    console.log(`[DB Check] Connection State: ${mongoose.STATES[conn.connection.readyState]}`);
    await mongoose.disconnect();
    console.log('[DB Check] Disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error(`[DB Check] Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

checkConnection();
