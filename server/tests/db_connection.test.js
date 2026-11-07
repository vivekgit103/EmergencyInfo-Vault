const mongoose = require('mongoose');
const dns = require('dns');

describe('Database Connection Fallback & DNS Override Controls', () => {
  let originalEnv;
  let exitMock;
  let connectMock;
  let dnsMock;

  beforeEach(() => {
    originalEnv = { ...process.env };
    exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
    dnsMock = jest.spyOn(dns, 'setServers').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    exitMock.mockRestore();
    dnsMock.mockRestore();
    if (connectMock) connectMock.mockRestore();
  });

  test('Refuses in-memory fallback and exits when NODE_ENV is production on failure', async () => {
    process.env.NODE_ENV = 'production';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:99999/unreachable';

    connectMock = jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('Connection refused'));

    const connectDB = require('../config/db');
    await connectDB();

    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('Refuses in-memory fallback and exits when NODE_ENV is test on failure', async () => {
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:99999/unreachable';

    connectMock = jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('Connection refused'));

    const connectDB = require('../config/db');
    await connectDB();

    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('Applies DNS override only when ENABLE_DNS_OVERRIDE is true', async () => {
    process.env.ENABLE_DNS_OVERRIDE = 'true';
    connectMock = jest.spyOn(mongoose, 'connect').mockResolvedValueOnce({});

    const connectDB = require('../config/db');
    await connectDB();

    expect(dnsMock).toHaveBeenCalledWith(['8.8.8.8', '1.1.1.1']);
  });

  test('Does not apply DNS override by default when flag is absent', async () => {
    delete process.env.ENABLE_DNS_OVERRIDE;
    delete process.env.ENABLE_ATLAS_DNS_OVERRIDE;
    connectMock = jest.spyOn(mongoose, 'connect').mockResolvedValueOnce({});

    const connectDB = require('../config/db');
    await connectDB();

    expect(dnsMock).not.toHaveBeenCalled();
  });
});
