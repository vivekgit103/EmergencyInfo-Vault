const mongoose = require('mongoose');
const dns = require('dns');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/emergencyinfo_vault';

  // Opt-in DNS override for environments with broken SRV lookup (e.g. some corporate VPNs or restricted networks)
  if (process.env.ENABLE_DNS_OVERRIDE === 'true' || process.env.ENABLE_ATLAS_DNS_OVERRIDE === 'true') {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('[DATABASE] Opt-in DNS override active: set nameservers to 8.8.8.8, 1.1.1.1');
    } catch (dnsErr) {
      console.warn('[DATABASE] Failed to set custom DNS servers:', dnsErr.message);
    }
  }

  // 1. Attempt connection to configured MongoDB URI
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[DATABASE] Connected to MongoDB at ${maskedUri}`);
    return conn;
  } catch (error) {
    // In-memory fallback is strictly restricted to development mode
    if (process.env.NODE_ENV !== 'development') {
      console.error(
        `[DATABASE FATAL] MongoDB connection failed: ${error.message}. ` +
        `In-memory fallback is disabled when NODE_ENV is '${process.env.NODE_ENV}'. Exiting.`
      );
      process.exit(1);
      return;
    }

    // 2. Local development fallback: launch mongodb-memory-server lazily
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
