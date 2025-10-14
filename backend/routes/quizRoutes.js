const express = require('express');
const router = express.Router();
const {
  getQuiz,
  submitQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizAttempts
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.get('/lesson/:lessonId', protect, getQuiz);
router.post('/:quizId/submit', protect, submitQuiz);
router.get('/:quizId/attempts', protect, getQuizAttempts);

// Admin routes
router.post('/lesson/:lessonId', protect, authorize('admin'), createQuiz);
router.put('/:id', protect, authorize('admin'), updateQuiz);
router.delete('/:id', protect, authorize('admin'), deleteQuiz);

module.exports = router;