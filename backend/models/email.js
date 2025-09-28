// routes/email.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  updateEmailPreferences,
  getEmailPreferences,
  sendTestEmail,
  unsubscribeUser,
  getEmailStats,
  sendBulkEmail
} = require('../controllers/emailController');

// User routes
router.use(protect);
router.get('/preferences', getEmailPreferences);
router.put('/preferences', updateEmailPreferences);
router.post('/test', sendTestEmail);

// Public route for unsubscribe
router.post('/unsubscribe/:token', unsubscribeUser);

// Admin routes
router.get('/stats', adminOnly, getEmailStats);
router.post('/bulk', adminOnly, sendBulkEmail);

module.exports = router;
