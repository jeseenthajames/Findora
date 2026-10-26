import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/findora';
  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'findora'
    });
    console.log(`[Findora DB] MongoDB Connected to database "${conn.connection.name}" on host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Findora DB Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[Findora DB Note] Please verify your MONGODB_URI in server/.env (e.g. MongoDB Atlas cluster with database 'findora').`);
    return null;
  }
};
