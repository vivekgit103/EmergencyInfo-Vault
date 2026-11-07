const User = require('../models/User');
const { seedDatabase } = require('../seed');

describe('Database Seed Security & Error Handling', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('Refuses to run and throws error when NODE_ENV === "production"', async () => {
    process.env.NODE_ENV = 'production';

    await expect(seedDatabase()).rejects.toThrow(
      /Database seeding is strictly forbidden in production/i
    );
  });

  test('Re-throws errors so failures do not silently succeed', async () => {
    process.env.NODE_ENV = 'development';
    const mockFindOne = jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Simulated DB failure'));

    await expect(seedDatabase()).rejects.toThrow('Simulated DB failure');

    mockFindOne.mockRestore();
  });

  test('Successfully seeds demo data in test environment', async () => {
    process.env.NODE_ENV = 'test';
    await seedDatabase();

    const demoUser = await User.findOne({ email: 'demo@example.com' });
    expect(demoUser).toBeDefined();
    expect(demoUser.name).toBe('Alex Taylor');
  });
});
