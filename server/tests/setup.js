const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  // Set test environment secrets
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
  process.env.COOKIE_SECRET = 'test_cookie_secret_key_12345';
  process.env.CLIENT_ORIGIN = 'http://localhost:5173';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/emergencyinfo_vault';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
