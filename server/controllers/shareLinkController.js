const crypto = require('crypto');
const ShareLink = require('../models/ShareLink');
const asyncHandler = require('../utils/asyncHandler');

// Map duration strings to milliseconds
const durationMap = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000
};

/**
 * @desc    Get all share links for current user
 * @route   GET /api/share-links
 * @access  Private
 */
const getShareLinks = asyncHandler(async (req, res) => {
  const shareLinks = await ShareLink.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    shareLinks
  });
});

/**
 * @desc    Generate a new emergency share link
 * @route   POST /api/share-links
 * @access  Private
 */
const createShareLink = asyncHandler(async (req, res) => {
  const activeCount = await ShareLink.countDocuments({
    userId: req.user._id,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
  if (activeCount >= 5) {
    return res.status(400).json({
      message: 'Maximum limit of 5 active share links reached. Please revoke or let existing links expire before creating a new one.'
    });
  }

  const { expiry = '24h', pin } = req.body;

  // Trim and validate PIN in controller as defense-in-depth:
  // Rejects invalid PINs with 400 so a link can never silently be created without the PIN the owner typed.
  let trimmedPin = null;
  if (Object.prototype.hasOwnProperty.call(req.body, 'pin') && pin !== null && pin !== undefined) {
    trimmedPin = String(pin).trim();
    if (!/^\d{6,}$/.test(trimmedPin)) {
      return res.status(400).json({
        message: 'Invalid PIN: PIN must be at least 6 numeric digits'
      });
    }
  }

  const durationMs = durationMap[expiry] || durationMap['24h'];
  const expiresAt = new Date(Date.now() + durationMs);

  // Generate unguessable 32-character hex token
  const token = crypto.randomBytes(16).toString('hex');

  const shareLink = new ShareLink({
    userId: req.user._id,
    token,
    expiresAt,
    isRevoked: false
  });

  if (trimmedPin) {
    await shareLink.setPin(trimmedPin);
  }

  await shareLink.save();

  res.status(201).json({
    message: 'Emergency share link created successfully',
    shareLink
  });
});

/**
 * @desc    Revoke or remove a share link
 * @route   DELETE /api/share-links/:id
 * @access  Private
 */
const deleteShareLink = asyncHandler(async (req, res) => {
  const shareLink = await ShareLink.findOne({ _id: req.params.id, userId: req.user._id });

  if (!shareLink) {
    return res.status(404).json({
      message: 'Share link not found or you do not have permission to modify it'
    });
  }

  // If permanent delete requested via query param ?permanent=true, remove completely.
  // Default behavior marks isRevoked = true so responders attempting to use the link
  // are informed that the link was explicitly revoked by the owner.
  if (req.query.permanent === 'true') {
    await ShareLink.deleteOne({ _id: shareLink._id });
    return res.status(200).json({
      message: 'Share link deleted permanently',
      id: req.params.id
    });
  }

  shareLink.isRevoked = true;
  await shareLink.save();

  res.status(200).json({
    message: 'Share link revoked successfully',
    shareLink
  });
});

module.exports = {
  getShareLinks,
  createShareLink,
  deleteShareLink
};
