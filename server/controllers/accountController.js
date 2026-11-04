const User = require('../models/User');
const Contact = require('../models/Contact');
const Instruction = require('../models/Instruction');
const ShareLink = require('../models/ShareLink');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Permanently delete user account and all associated emergency data
 * @route   DELETE /api/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      message: 'Password confirmation is required to delete your account'
    });
  }

  // Fetch full user record including password hash
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      message: 'User account not found'
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: 'Incorrect password. Account deletion aborted.'
    });
  }

  const userId = user._id;

  // Cascade deletion across all user data
  await Promise.all([
    Contact.deleteMany({ userId }),
    Instruction.deleteMany({ userId }),
    ShareLink.deleteMany({ userId }),
    User.deleteOne({ _id: userId })
  ]);

  // Clear auth cookie
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax'
  });

  res.status(200).json({
    message: 'Your account and all associated contacts, instructions, and share links have been permanently deleted.'
  });
});

module.exports = {
  deleteAccount
};
