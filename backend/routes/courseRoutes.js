const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  enrollCourse,
  getMyCourses
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes
router.get('/my/courses', protect, getMyCourses);
router.post('/:id/enroll', protect, enrollCourse);

// Admin routes
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);
router.put('/:id/publish', protect, authorize('admin'), publishCourse);

module.exports = router;