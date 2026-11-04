const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emergencyinfo_vault';

  // 1. Attempt connection to configured MongoDB URI
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[DATABASE] Connected to MongoDB at ${uri}`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[DATABASE FATAL] Production MongoDB Connection Failed: ${error.message}`);
      process.exit(1);
    }

    // 2. Local development fallback: launch mongodb-memory-server
    console.warn(`[DATABASE] No local MongoDB server detected at ${uri} (${error.message}).`);
    console.log('[DATABASE] Starting in-memory MongoDB server (mongodb-memory-server) for local development...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[DATABASE] Connected to in-memory MongoDB at ${memUri}`);

      // Auto-populate demo user into fresh in-memory database
      try {
        const { seedDatabase } = require('../seed');
        await seedDatabase();
      } catch (seedErr) {
        console.warn('[DATABASE] Auto-seeding skipped:', seedErr.message);
      }

      return conn;
    } catch (memErr) {
      console.error(`[DATABASE FATAL] Failed to initialize in-memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
