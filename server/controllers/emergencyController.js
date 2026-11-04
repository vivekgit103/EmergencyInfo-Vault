const ShareLink = require('../models/ShareLink');
const User = require('../models/User');
const Contact = require('../models/Contact');
const Instruction = require('../models/Instruction');
const asyncHandler = require('../utils/asyncHandler');

const priorityOrder = { primary: 1, secondary: 2, other: 3 };

/**
 * Helper to fetch and format public emergency payload
 */
const getEmergencyPayload = async (userId, expiresAt) => {
  const user = await User.findById(userId).select('name');
  if (!user) {
    return null;
  }

  // Fetch only emergency-visible contacts
  const contacts = await Contact.find({
    userId,
    showInEmergency: true
  }).select('name relationship phone priority');

  // Sort contacts by priority
  const sortedContacts = contacts.sort((a, b) => {
    return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
  });

  // Fetch only emergency-visible instructions
  const instructions = await Instruction.find({
    userId,
    showInEmergency: true
  }).select('title text');

  return {
    ownerName: user.name,
    contacts: sortedContacts.map(c => ({
      _id: c._id,
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      priority: c.priority
    })),
    instructions: instructions.map(i => ({
      _id: i._id,
      title: i.title,
      text: i.text
    })),
    expiresAt
  };
};

/**
 * @desc    View public emergency card payload
 * @route   POST /api/emergency/:token
 * @access  Public
 */
const viewEmergencyCard = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { pin } = req.body || {};

  const shareLink = await ShareLink.findOne({ token });

  // 1. Link does not exist
  if (!shareLink) {
    return res.status(404).json({
      message: 'This emergency card link does not exist or has been removed.'
    });
  }

  // 2. Link revoked by owner
  if (shareLink.isRevoked) {
    return res.status(403).json({
      message: 'This emergency card link has been revoked by the owner.'
    });
  }

  // 3. Link expired
  if (shareLink.isExpired()) {
    return res.status(410).json({
      message: 'This emergency card link has expired.'
    });
  }

  // 4. Link locked due to repeated PIN failures
  if (shareLink.isLocked()) {
    const minutesLeft = Math.ceil((new Date(shareLink.lockedUntil) - new Date()) / 60000);
    return res.status(429).json({
      message: `This emergency card is temporarily locked due to repeated incorrect PIN attempts. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
      lockedUntil: shareLink.lockedUntil
    });
  }

  // 5. PIN verification
  if (shareLink.hasPin) {
    if (!pin) {
      return res.status(401).json({
        requiresPin: true,
        message: 'This emergency card is protected with a PIN. Please enter the PIN to view.'
      });
    }

    const isMatch = await shareLink.matchPin(pin);
    if (!isMatch) {
      shareLink.pinAttempts = (shareLink.pinAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;

      if (shareLink.pinAttempts >= MAX_ATTEMPTS) {
        shareLink.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await shareLink.save();
        return res.status(429).json({
          requiresPin: true,
          message: 'Too many incorrect PIN attempts. This card has been locked for 15 minutes.',
          lockedUntil: shareLink.lockedUntil
        });
      }

      await shareLink.save();
      const remaining = MAX_ATTEMPTS - shareLink.pinAttempts;
      return res.status(401).json({
        requiresPin: true,
        message: `Incorrect PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary lockout.`,
        remainingAttempts: remaining
      });
    }

    // Correct PIN: reset attempts
    if (shareLink.pinAttempts > 0) {
      shareLink.pinAttempts = 0;
      shareLink.lockedUntil = null;
      await shareLink.save();
    }
  }

  // 6. Fetch minimal public payload
  const payload = await getEmergencyPayload(shareLink.userId, shareLink.expiresAt);
  if (!payload) {
    return res.status(404).json({
      message: 'The owner of this emergency card could not be found.'
    });
  }

  res.status(200).json(payload);
});

/**
 * @desc    Check emergency card metadata (e.g. requires PIN, expired, etc.)
 * @route   GET /api/emergency/:token
 * @access  Public
 */
const checkEmergencyStatus = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const shareLink = await ShareLink.findOne({ token });

  if (!shareLink) {
    return res.status(404).json({
      message: 'This emergency card link does not exist or has been removed.'
    });
  }

  if (shareLink.isRevoked) {
    return res.status(403).json({
      message: 'This emergency card link has been revoked by the owner.'
    });
  }

  if (shareLink.isExpired()) {
    return res.status(410).json({
      message: 'This emergency card link has expired.'
    });
  }

  if (shareLink.isLocked()) {
    const minutesLeft = Math.ceil((new Date(shareLink.lockedUntil) - new Date()) / 60000);
    return res.status(429).json({
      message: `This emergency card is temporarily locked due to repeated incorrect PIN attempts. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
      lockedUntil: shareLink.lockedUntil
    });
  }

  if (shareLink.hasPin) {
    return res.status(200).json({
      requiresPin: true,
      message: 'This emergency card is protected with a PIN.'
    });
  }

  // If no PIN required, return payload directly
  const payload = await getEmergencyPayload(shareLink.userId, shareLink.expiresAt);
  if (!payload) {
    return res.status(404).json({
      message: 'The owner of this emergency card could not be found.'
    });
  }

  res.status(200).json({
    requiresPin: false,
    ...payload
  });
});

module.exports = {
  viewEmergencyCard,
  checkEmergencyStatus
};
