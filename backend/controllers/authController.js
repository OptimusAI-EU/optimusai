const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const validator = require('validator');
const nodemailer = require('nodemailer');
const geoip = require('geoip-lite');
const axios = require('axios');

// Lazy load User model to avoid circular dependencies
let User;
const getUser = () => {
  if (!User) {
    User = require('../models').User;
  }
  return User;
};

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  host: config.email.host,
  port: parseInt(config.email.port) || 587,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

// Generate email verification token
const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};

// Send verification email
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: 'Email Verification - Optimus AI',
    html: `
      <h2>Welcome to Optimus AI, ${firstName}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Verify Email Address
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create this account, please ignore this email.</p>
    `,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Generate JWT tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role, id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });

  const refreshToken = jwt.sign({ userId, id: userId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire,
  });

  return { accessToken, refreshToken };
};

// Set authentication cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = config.env === 'production';
  
  // Access token cookie (15 minutes)
  res.cookie('accessToken', accessToken, {
    httpOnly: true, // Prevents JavaScript from accessing the cookie
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'Strict', // CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  // Refresh token cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

// Get user's IP address
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

// Fetch location data from IP address
const fetchLocationFromIp = async (ipAddress) => {
  try {
    // Check if it's a localhost/private IP
    const isLocalhost = ipAddress === '::1' || ipAddress === '127.0.0.1' || 
                       ipAddress.startsWith('192.168.') || 
                       ipAddress.startsWith('10.') ||
                       ipAddress.startsWith('172.');
    
    // For localhost, try to get actual public IP first
    if (isLocalhost) {
      try {
        const publicIpResponse = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
        if (publicIpResponse.data && publicIpResponse.data.ip) {
          return await fetchLocationFromIp(publicIpResponse.data.ip);
        }
      } catch (e) {
        console.log('Could not get public IP for localhost, using mock data');
      }
      
      // Return mock data for localhost
      return {
        ip: ipAddress,
        country: 'US',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        isp: 'Local Development',
        timezone: 'America/Los_Angeles',
      };
    }

    // Try ipapi.co first (has ISP info)
    try {
      const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`, { timeout: 5000 });
      if (response.data) {
        return {
          ip: ipAddress,
          country: response.data.country_name || response.data.country_code || 'Unknown',
          city: response.data.city || 'Unknown',
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          isp: response.data.org || 'Unknown',
          timezone: response.data.timezone,
        };
      }
    } catch (apiError) {
      console.error('Error fetching from ipapi:', apiError.message);
    }

    // Fallback: use geoip-lite
    try {
      const geoData = geoip.lookup(ipAddress);
      if (geoData) {
        return {
          ip: ipAddress,
          country: geoData.country,
          city: geoData.city || 'Unknown',
          latitude: geoData.ll ? geoData.ll[0] : null,
          longitude: geoData.ll ? geoData.ll[1] : null,
          isp: 'Unknown',
          timezone: geoData.timezone,
        };
      }
    } catch (geoError) {
      console.error('Error with geoip-lite:', geoError.message);
    }

    return {
      ip: ipAddress,
      country: 'Unknown',
      city: 'Unknown',
      latitude: null,
      longitude: null,
      isp: 'Unknown',
      timezone: 'Unknown',
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return {
      ip: ipAddress,
      country: 'Unknown',
      city: 'Unknown',
      latitude: null,
      longitude: null,
      isp: 'Unknown',
      timezone: 'Unknown',
    };
  }
};

// Detect VPN status using IPQualityScore
const detectVPNStatus = async (ipAddress) => {
  try {
    // Check if this is a localhost/private IP - skip IPQS for these
    const isLocalhost = ipAddress === '::1' || ipAddress === '127.0.0.1' || 
                       ipAddress.startsWith('192.168.') || 
                       ipAddress.startsWith('10.') ||
                       ipAddress.startsWith('172.');

    if (isLocalhost) {
      console.log(`⚠️  Localhost/Private IP detected (${ipAddress}), skipping IPQS API`);
      return { isVPN: false, provider: null, fraudScore: 0 };
    }

    // Check if API key is configured
    if (!process.env.IPQS_API_KEY) {
      console.warn('⚠️ IPQS_API_KEY not configured, skipping VPN detection');
      return { isVPN: false, provider: null, fraudScore: 0 };
    }

    console.log(`🔍 Calling IPQS API for IP: ${ipAddress}`);

    const response = await axios.get(
      'https://ipqualityscore.com/api/json/ip',
      {
        params: {
          ip: ipAddress,
          strictness: 1,
          format: 'json',
        },
        headers: {
          'IPQS-KEY': process.env.IPQS_API_KEY,
        },
        timeout: 5000,
      }
    );

    console.log(`✅ IPQS Response:`, {
      is_vpn: response.data.is_vpn,
      is_proxy: response.data.is_proxy,
      fraud_score: response.data.fraud_score,
      host: response.data.host,
    });

    const vpnProvider = identifyVPNProvider(response.data.host || '');

    const result = {
      isVPN: response.data.is_vpn === true, // Explicitly convert to boolean
      isProxy: response.data.is_proxy === true,
      isTor: response.data.is_tor === true,
      provider: vpnProvider || null,
      fraudScore: response.data.fraud_score || 0,
      confidence: calculateVPNConfidence(response.data),
    };

    console.log(`📊 VPN Detection Result:`, result);
    return result;
  } catch (error) {
    console.error('❌ Error detecting VPN:', error.message);
    console.error('Error details:', error.response?.data || error);
    return { isVPN: false, provider: null, fraudScore: 0 };
  }
};

// Identify VPN provider from hostname
const identifyVPNProvider = (hostName) => {
  const providers = {
    'expressvpn': 'ExpressVPN',
    'nordvpn': 'NordVPN',
    'protonvpn': 'ProtonVPN',
    'surfshark': 'Surfshark',
    'windscribe': 'Windscribe',
    'cyberghost': 'CyberGhost',
    'purevpn': 'PureVPN',
    'hotspotshield': 'HotspotShield',
  };

  const lowerHost = hostName.toLowerCase();
  for (const [key, name] of Object.entries(providers)) {
    if (lowerHost.includes(key)) {
      return name;
    }
  }

  return null;
};

// Calculate VPN detection confidence
const calculateVPNConfidence = (ipqsData) => {
  let score = 0;
  if (ipqsData.is_vpn) score += 40;
  if (ipqsData.is_proxy) score += 30;
  if (ipqsData.is_crawler) score += 20;
  if (ipqsData.fraud_score > 75) score += 10;
  return Math.min(score, 100);
};

// Create user session record with VPN detection
const createUserSession = async (userId, req) => {
  try {
    const { UserSession, User } = require('../models');
    const ipAddress = getClientIp(req);
    
    // Fetch location data
    const location = await fetchLocationFromIp(ipAddress);
    
    // Detect VPN status
    const vpnDetection = await detectVPNStatus(ipAddress);
    
    // Determine if this is a VPN location or actual location
    let sessionData = {
      userId,
      ipAddress,
      userAgent: req.headers['user-agent'] || 'unknown',
      loginTime: new Date(),
      isActive: true,
      isVPNDetected: vpnDetection.isVPN,
      vpnProvider: vpnDetection.provider,
      vpnDetectionScore: vpnDetection.fraudScore,
    };

    if (vpnDetection.isVPN) {
      // VPN is active - store as VPN location
      sessionData.vpnLocation = location;
      sessionData.vpnDetectionHistory = [{
        timestamp: new Date(),
        ip: ipAddress,
        isVPN: true,
        provider: vpnDetection.provider,
        method: 'login',
        fraudScore: vpnDetection.fraudScore,
      }];
    } else {
      // No VPN - store as real location
      sessionData.realLocation = location;
      sessionData.realIPConfirmedAt = new Date();
      sessionData.vpnDetectionHistory = [{
        timestamp: new Date(),
        ip: ipAddress,
        isVPN: false,
        provider: null,
        method: 'login',
        fraudScore: vpnDetection.fraudScore,
      }];
    }

    // Also store location in location field for backward compatibility
    sessionData.location = location;

    const session = await UserSession.create(sessionData);

    // Update user's last location info
    const updateData = {
      lastIPAddress: ipAddress,
      lastISP: location.isp || 'Unknown',
    };

    if (vpnDetection.isVPN) {
      updateData.lastVPNLocation = {
        ...location,
        detectedAt: new Date(),
        provider: vpnDetection.provider,
      };
      updateData.isVPNCurrentlyDetected = true;
    } else {
      updateData.lastActualLocation = {
        ...location,
        confirmedAt: new Date(),
      };
      updateData.isVPNCurrentlyDetected = false;
    }

    // Add to location history
    const user = await User.findByPk(userId);
    const locationHistory = user.locationHistory || [];
    locationHistory.push({
      type: vpnDetection.isVPN ? 'vpn' : 'actual',
      location,
      ip: ipAddress,
      isp: location.isp,
      timestamp: new Date(),
      provider: vpnDetection.provider,
    });

    updateData.locationHistory = locationHistory.slice(-50); // Keep last 50

    await User.update(updateData, { where: { id: userId } });

    console.log(`✅ Session created for user ${userId}`);
    console.log(`   IP: ${ipAddress}, VPN: ${vpnDetection.isVPN}, Provider: ${vpnDetection.provider || 'None'}`);

    return session;
  } catch (error) {
    console.error('Error creating user session:', error);
    return null;
  }
};

// Update user preferences on login
const ensureUserPreferences = async (userId) => {
  try {
    const { UserPreference } = require('../models');
    
    let preferences = await UserPreference.findOne({ where: { userId } });
    if (!preferences) {
      preferences = await UserPreference.create({ userId });
    }
    
    return preferences;
  } catch (error) {
    console.error('Error ensuring user preferences:', error);
    return null;
  }
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

    // Password validation: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character',
      });
    }

    // Check if user exists
    let user = await getUser().findOne({ where: { email } });
    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Generate verification token
    const { token, hash } = generateVerificationToken();

    // Create user
    user = await getUser().create({
      email,
      password,
      firstName,
      lastName,
      phone,
      isEmailVerified: email === 'optimusrobots@proton.me', // Auto-verify admin email
      emailVerificationToken: hash,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email only if not admin email
    if (email !== 'optimusrobots@proton.me') {
      const emailSent = await sendVerificationEmail(email, firstName, token);
      
      if (!emailSent) {
        // Delete user if email fails to send
        await user.destroy();
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please try again later.',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: user.getPublicProfile(),
      });
    }

    // For admin email, auto-login
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

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

    // Find user by email
    const user = await getUser().findOne({ where: { email } });

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

    // Check if email is verified (skip for admin email)
    if (!user.isEmailVerified && email !== 'optimusrobots@proton.me') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before signing in',
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set authentication cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Create user session record
    await createUserSession(user.id, req);

    // Ensure user preferences exist
    await ensureUserPreferences(user.id);

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
    // User is already created/found by Passport strategy
    const user = req.user;

    if (!user) {
      return res.redirect(`${config.frontendUrl}?auth=failed`);
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set authentication cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Create user session record
    await createUserSession(user.id, req);

    // Ensure user preferences exist
    await ensureUserPreferences(user.id);

    // Redirect to frontend with tokens in URL
    res.redirect(
      `${config.frontendUrl}/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&provider=google`
    );
  } catch (error) {
    res.redirect(`${config.frontendUrl}?auth=error`);
  }
};

// GitHub OAuth callback
exports.githubCallback = async (req, res, next) => {
  try {
    // User is already created/found by Passport strategy
    const user = req.user;

    if (!user) {
      return res.redirect(`${config.frontendUrl}?auth=failed`);
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Set authentication cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Create user session record
    await createUserSession(user.id, req);

    // Ensure user preferences exist
    await ensureUserPreferences(user.id);

    // Redirect to frontend with tokens in URL
    res.redirect(
      `${config.frontendUrl}/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&provider=github`
    );
  } catch (error) {
    res.redirect(`${config.frontendUrl}?auth=error`);
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
    const userId = req.user?.id || req.userId;
    console.log(`👤 Logout initiated for user: ${userId}`);

    if (userId) {
      try {
        // Mark session as inactive
        const { UserSession } = require('../models');
        const result = await UserSession.update(
          { isActive: false, logoutTime: new Date() },
          { where: { userId, isActive: true } }
        );
        console.log(`✅ Session update result:`, result);
        console.log(`   Updated ${result[0]} sessions to inactive`);
      } catch (error) {
        console.error('❌ Error updating user session:', error);
      }
    }

    // Clear authentication cookies
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Detect VPN/IP changes for active sessions
exports.detectVPNChange = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    console.log(`🔄 detectVPNChange called for user: ${userId}`);
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { UserSession, User } = require('../models');
    const newIp = getClientIp(req);
    console.log(`   IP Address: ${newIp}`);

    // Get the user's last active session
    const activeSession = await UserSession.findOne({
      where: { userId, isActive: true },
      order: [['loginTime', 'DESC']],
    });

    if (!activeSession) {
      console.log(`   ⚠️ No active session found for user ${userId}`);
      return res.status(404).json({ success: false, message: 'No active session found' });
    }

    console.log(`   Active session found (ID: ${activeSession.id})`);
    console.log(`   Previous IP: ${activeSession.ipAddress}, Current VPN Status: ${activeSession.isVPNDetected}`);

    // Check if IP has changed
    const ipChanged = newIp !== activeSession.ipAddress;

    // ALWAYS check VPN status, even if IP hasn't changed (VPN might have been toggled)
    const newLocation = await fetchLocationFromIp(newIp);
    const vpnDetection = await detectVPNStatus(newIp);

    console.log(`📍 VPN Status Check for user ${userId}:`);
    console.log(`   IP: ${newIp}`);
    console.log(`   VPN Detected: ${vpnDetection.isVPN}`);
    console.log(`   VPN Provider: ${vpnDetection.provider || 'none'}`);
    console.log(`   Previous VPN Status: ${activeSession.isVPNDetected}`);
    console.log(`   Location: ${newLocation?.city}, ${newLocation?.country}`);

    // Build update data
    const updateData = {
      ipAddress: newIp,
      isVPNDetected: vpnDetection.isVPN,
      vpnProvider: vpnDetection.provider,
      vpnDetectionScore: vpnDetection.fraudScore,
      location: newLocation, // Always update backward compat field
    };

    // Store appropriate location based on VPN status
    if (vpnDetection.isVPN) {
      updateData.vpnLocation = newLocation;
      updateData.realLocation = null;
      updateData.realIPConfirmedAt = null;
    } else {
      updateData.realLocation = newLocation;
      updateData.realIPConfirmedAt = new Date();
      updateData.vpnLocation = null;
    }

    // Add to detection history
    const vpnDetectionHistory = activeSession.vpnDetectionHistory || [];
    vpnDetectionHistory.push({
      timestamp: new Date(),
      ip: newIp,
      isVPN: vpnDetection.isVPN,
      provider: vpnDetection.provider,
      method: 'vpn_change_detection',
      fraudScore: vpnDetection.fraudScore,
    });
    updateData.vpnDetectionHistory = vpnDetectionHistory;

    await UserSession.update(updateData, { where: { id: activeSession.id } });

    // Also update user's last location
    const user = await User.findByPk(userId);
    const userUpdateData = {
      lastIPAddress: newIp,
      lastISP: newLocation.isp || 'Unknown',
    };

    if (vpnDetection.isVPN) {
      userUpdateData.lastVPNLocation = {
        ...newLocation,
        detectedAt: new Date(),
        provider: vpnDetection.provider,
      };
      userUpdateData.isVPNCurrentlyDetected = true;
    } else {
      userUpdateData.lastActualLocation = {
        ...newLocation,
        confirmedAt: new Date(),
      };
      userUpdateData.isVPNCurrentlyDetected = false;
    }

    // Add to location history
    const locationHistory = user.locationHistory || [];
    locationHistory.push({
      type: vpnDetection.isVPN ? 'vpn' : 'actual',
      location: newLocation,
      ip: newIp,
      isp: newLocation.isp,
      timestamp: new Date(),
      provider: vpnDetection.provider,
    });
    userUpdateData.locationHistory = locationHistory.slice(-50);

    await User.update(userUpdateData, { where: { id: userId } });

    console.log(`✅ VPN/IP status checked for user ${userId}`);
    console.log(`   IP: ${newIp} (changed: ${ipChanged})`);
    console.log(`   VPN Status: ${vpnDetection.isVPN ? 'Active (' + vpnDetection.provider + ')' : 'Disabled'}`);

    return res.json({
      success: true,
      message: 'VPN/IP status updated',
      vpnStatusChanged: vpnDetection.isVPN !== activeSession.isVPNDetected || ipChanged,
      ipChanged,
      newStatus: {
        isVPNDetected: vpnDetection.isVPN,
        vpnProvider: vpnDetection.provider,
        location: newLocation,
      },
    });
  } catch (error) {
    console.error('Error detecting VPN change:', error);
    next(error);
  }
};

// Verify email address
exports.verifyEmail = async (req, res, next) => {
  try {
    // Token can come from query params or request body
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Hash the token to match the stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token
    const user = await getUser().findOne({
      where: {
        emailVerificationToken: tokenHash,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });
    }

    // Check if token has expired
    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please sign up again.',
      });
    }

    // Verify email and clear tokens
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now sign in with your account.',
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await getUser().findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const { token, hash } = generateVerificationToken();

    await user.update({
      emailVerificationToken: hash,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    const emailSent = await sendVerificationEmail(email, user.firstName, token);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
      });
    }

    res.json({
      success: true,
      message: 'Verification email resent successfully. Please check your email.',
    });
  } catch (error) {
    next(error);
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: 'Password Reset - Optimus AI',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${firstName},</p>
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
      <p>For security reasons, do not share this link with anyone.</p>
    `,
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Password reset email sending error:', error);
    return false;
  }
};

// Forgot password - send reset email
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    const User = getUser();
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      // Security: Return specific error for non-existent email
      return res.status(404).json({
        success: false,
        message: 'No user account is associated with this email address.',
      });
    }

    // Generate password reset token
    const { token, hash } = generateVerificationToken();

    // Store hash and expiration (1 hour)
    await user.update({
      passwordResetToken: hash,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const emailSent = await sendPasswordResetEmail(email, user.firstName, token);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.',
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent successfully. Please check your email.',
    });
  } catch (error) {
    next(error);
  }
};

// Reset password with token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validation
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Password validation: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
      });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const User = getUser();
    const user = await User.findOne({
      where: {
        passwordResetToken: tokenHash,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Check if token has expired
    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token has expired. Please request a new one.',
      });
    }

    // Update password and clear reset token
    await user.update({
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

