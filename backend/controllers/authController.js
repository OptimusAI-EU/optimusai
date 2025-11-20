const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const validator = require('validator');

// Generate JWT tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });

  const refreshToken = jwt.sign({ userId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire,
  });

  return { accessToken, refreshToken };
};

// Register with email/password
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      isEmailVerified: false,
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// Login with email/password
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    // Log login history
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully',
      accessToken,
      refreshToken,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth callback
exports.googleCallback = async (req, res, next) => {
  try {
    const { id, displayName, emails, photos } = req.user;
    const email = emails[0].value;
    const [firstName, lastName] = displayName.split(' ');

    let user = await User.findOne({ 'oauth.googleId': id });

    if (!user) {
      user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          firstName: firstName || 'User',
          lastName: lastName || '',
          isEmailVerified: true,
        });
      }

      user.oauth.googleId = id;
      user.oauth.googleProfile = req.user;
    }

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Redirect to frontend with tokens
    res.redirect(
      `${config.frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  } catch (error) {
    next(error);
  }
};

// GitHub OAuth callback
exports.githubCallback = async (req, res, next) => {
  try {
    const { id, username, displayName, emails, photos } = req.user;
    const email = emails?.[0]?.value;
    const [firstName, lastName] = (displayName || username).split(' ');

    let user = await User.findOne({ 'oauth.githubId': id });

    if (!user) {
      user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email: email || `${username}@github.local`,
          firstName: firstName || username,
          lastName: lastName || '',
          isEmailVerified: !!email,
        });
      }

      user.oauth.githubId = id;
      user.oauth.githubProfile = req.user;
    }

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Redirect to frontend with tokens
    res.redirect(
      `${config.frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      const tokens = generateTokens(user._id, user.role);

      res.json({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
