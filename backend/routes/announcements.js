const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAnnouncements,
  getAllAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement,
  getAnnouncementStats,
  getUnreadCount,
  markAsRead
} = require('../controllers/announcementController');

// All routes require authentication
router.use(protect);

// User routes
router.get('/', getAnnouncements);
router.get('/unread/count', getUnreadCount);
router.get('/:id', getAnnouncement);
router.put('/:id/read', markAsRead);

// Admin routes
router.get('/admin/all', adminOnly, getAllAnnouncements);
router.get('/admin/stats', adminOnly, getAnnouncementStats);
router.post('/', adminOnly, createAnnouncement);
router.put('/:id', adminOnly, updateAnnouncement);
router.delete('/:id', adminOnly, deleteAnnouncement);
router.put('/:id/archive', adminOnly, archiveAnnouncement);

module.exports = router;