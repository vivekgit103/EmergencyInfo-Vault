const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const shareLinkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    hasPin: {
      type: Boolean,
      default: false
    },
    pinHash: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    pinAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    },
    accessCount: {
      type: Number,
      default: 0
    },
    lastAccessedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// TTL index with a 7-day buffer (604,800 seconds) after expiry date
shareLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 7 * 24 * 3600 });

// Helper method to set PIN
shareLinkSchema.methods.setPin = async function (pin) {
  if (pin && String(pin).trim().length >= 6) {
    const salt = await bcrypt.genSalt(10);
    this.pinHash = await bcrypt.hash(String(pin).trim(), salt);
    this.hasPin = true;
  } else {
    this.pinHash = null;
    this.hasPin = false;
  }
};

// Helper method to verify PIN
shareLinkSchema.methods.matchPin = async function (enteredPin) {
  if (!this.pinHash) {
    return true; // No PIN required
  }
  if (!enteredPin) {
    return false;
  }
  return await bcrypt.compare(enteredPin.toString(), this.pinHash);
};

// Helper to check if link is currently locked
shareLinkSchema.methods.isLocked = function () {
  if (!this.lockedUntil) return false;
  return new Date() < this.lockedUntil;
};

// Helper to check if link is expired
shareLinkSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// ToJSON hides pinHash
shareLinkSchema.methods.toJSON = function () {
  const link = this.toObject();
  delete link.pinHash;
  return link;
};

module.exports = mongoose.model('ShareLink', shareLinkSchema);
