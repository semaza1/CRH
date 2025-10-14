const express = require('express');
const router = express.Router();
const {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.get('/course/:courseId', protect, getLessons);
router.get('/:id', protect, getLesson);
router.post('/:id/complete', protect, completeLesson);

// Admin routes
router.post('/course/:courseId', protect, authorize('admin'), createLesson);
router.put('/:id', protect, authorize('admin'), updateLesson);
router.delete('/:id', protect, authorize('admin'), deleteLesson);

module.exports = router;