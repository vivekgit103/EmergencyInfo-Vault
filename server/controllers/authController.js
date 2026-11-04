const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken, getCookieOptions } = require('../utils/tokenUtils');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      message: 'An account with this email address already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password
  });

  const token = generateToken(user._id);
  res.cookie('token', token, getCookieOptions());

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({
      message: 'Invalid email or password'
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      message: 'Invalid email or password'
    });
  }

  const token = generateToken(user._id);
  res.cookie('token', token, getCookieOptions());

  res.status(200).json({
    message: 'Logged in successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
});

/**
 * @desc    Log out current user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logoutUser = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax'
  });

  res.status(200).json({
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe
};
