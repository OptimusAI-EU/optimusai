const express = require('express');
const preferencesController = require('../controllers/preferencesController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Preferences routes
router.get('/preferences', verifyToken, preferencesController.getPreferences);
router.put('/preferences', verifyToken, preferencesController.updatePreferences);

// Sessions routes
router.get('/sessions', verifyToken, preferencesController.getSessions);
router.get('/sessions/active', verifyToken, preferencesController.getActiveSessions);
router.post('/sessions/:sessionId/logout', verifyToken, preferencesController.logoutSession);
router.post('/sessions/logout-all-others', verifyToken, preferencesController.logoutAllOtherSessions);

module.exports = router;
