const { getUser } = require('../models');

// Get user preferences
exports.getPreferences = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { UserPreference } = require('../models');
    let preferences = await UserPreference.findOne({ where: { userId } });

    if (!preferences) {
      preferences = await UserPreference.create({ userId });
    }

    res.json({
      success: true,
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

// Update user preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { language, theme, textSize, emailNotifications, pushNotifications, marketingEmails, timezone } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { UserPreference } = require('../models');
    let preferences = await UserPreference.findOne({ where: { userId } });

    if (!preferences) {
      preferences = await UserPreference.create({ userId });
    }

    // Update only provided fields
    const updateData = {};
    if (language !== undefined) updateData.language = language;
    if (theme !== undefined) updateData.theme = theme;
    if (textSize !== undefined) updateData.textSize = textSize;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;
    if (marketingEmails !== undefined) updateData.marketingEmails = marketingEmails;
    if (timezone !== undefined) updateData.timezone = timezone;

    await preferences.update(updateData);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

// Get user sessions
exports.getSessions = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { UserSession } = require('../models');
    const sessions = await UserSession.findAll({
      where: { userId },
      order: [['loginTime', 'DESC']],
    });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// Get active sessions
exports.getActiveSessions = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { UserSession } = require('../models');
    const sessions = await UserSession.findAll({
      where: { userId, isActive: true },
      order: [['loginTime', 'DESC']],
    });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// Logout session (invalidate a specific session)
exports.logoutSession = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    const { sessionId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { UserSession } = require('../models');
    const session = await UserSession.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    await session.update({
      isActive: false,
      logoutTime: new Date(),
    });

    res.json({
      success: true,
      message: 'Session logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Logout all other sessions (keep current session active)
exports.logoutAllOtherSessions = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { UserSession } = require('../models');
    
    // Get current session IP/user agent
    const currentSession = await UserSession.findOne({
      where: { userId, isActive: true },
      order: [['loginTime', 'DESC']],
    });

    if (currentSession) {
      // Logout all other sessions
      await UserSession.update(
        { isActive: false, logoutTime: new Date() },
        {
          where: {
            userId,
            id: { [require('sequelize').Op.ne]: currentSession.id },
          },
        }
      );
    }

    res.json({
      success: true,
      message: 'All other sessions have been logged out',
    });
  } catch (error) {
    next(error);
  }
};
