require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Contact = require('./models/Contact');
const Instruction = require('./models/Instruction');
const ShareLink = require('./models/ShareLink');

const seedDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database seeding is strictly forbidden in production (NODE_ENV=production).');
  }

  try {
    const existingDemoUser = await User.findOne({ email: 'demo@example.com' });
    if (existingDemoUser) {
      await Contact.deleteMany({ userId: existingDemoUser._id });
      await Instruction.deleteMany({ userId: existingDemoUser._id });
      await ShareLink.deleteMany({ userId: existingDemoUser._id });
      await User.deleteOne({ _id: existingDemoUser._id });
    }

    const demoUser = await User.create({
      name: 'Alex Taylor',
      email: 'demo@example.com',
      password: 'Password123!'
    });

    await Contact.create([
      {
        userId: demoUser._id,
        name: 'Sarah Taylor',
        relationship: 'Spouse',
        phone: '+1-555-0145',
        priority: 'primary',
        showInEmergency: true
      },
      {
        userId: demoUser._id,
        name: 'Dr. Marcus Vance',
        relationship: 'Physician',
        phone: '+1-555-0198',
        priority: 'secondary',
        showInEmergency: true
      },
      {
        userId: demoUser._id,
        name: 'Jordan Lee',
        relationship: 'Sibling',
        phone: '+1-555-0123',
        priority: 'other',
        showInEmergency: false
      }
    ]);

    await Instruction.create([
      {
        userId: demoUser._id,
        title: 'Asthma Inhaler Location',
        text: 'Albuterol inhaler is in the front outer zipper pocket of the gray backpack.',
        showInEmergency: true
      },
      {
        userId: demoUser._id,
        title: 'Severe Peanut Allergy',
        text: 'Anaphylaxis risk. Carry EpiPen in coat pocket. Do not administer aspirin.',
        showInEmergency: true
      },
      {
        userId: demoUser._id,
        title: 'Blood Type & Organ Donor',
        text: 'Type O Positive. Registered organ donor.',
        showInEmergency: true
      },
      {
        userId: demoUser._id,
        title: 'Home Spare Key Info',
        text: 'Spare apartment key is with apartment building concierge desk.',
        showInEmergency: false
      }
    ]);

    const publicLink = new ShareLink({
      userId: demoUser._id,
      token: 'demo-emergency-token-1234567890',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isRevoked: false
    });
    await publicLink.save();

    const pinProtectedLink = new ShareLink({
      userId: demoUser._id,
      token: 'demo-pin-protected-token-987654',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false
    });
    await pinProtectedLink.setPin('432100');
    await pinProtectedLink.save();

    console.log('[SEED] Demo user & data initialized: demo@example.com / Password123!');
  } catch (err) {
    console.error('[SEED] Failed to seed data:', err.message);
    throw err;
  }
};

if (require.main === module) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL] Database seeding is strictly forbidden in production environments.');
    process.exit(1);
  }

  const connectDB = require('./config/db');
  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      console.log('Seed completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[FATAL] Seed operation failed:', err.message);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
