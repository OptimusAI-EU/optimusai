const express = require('express');
const contactController = require('../controllers/contactController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public route - submit contact form
router.post('/', contactController.submitContactForm);

// Admin routes
router.get('/', isAdmin, verifyToken, contactController.getContactForms);
router.get('/:id', verifyToken, contactController.getContactForm);
router.put('/:id', isAdmin, verifyToken, contactController.updateContactFormStatus);
router.post('/:id/response', isAdmin, verifyToken, contactController.addContactFormResponse);

module.exports = router;
