const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: true
  },
  answers: [{
    questionId: mongoose.Schema.ObjectId,
    answer: mongoose.Schema.Types.Mixed, // Can be string, array, etc.
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number // in seconds
  }
}, {
  timestamps: true
});

// Index for efficient querying
QuizAttemptSchema.index({ user: 1, quiz: 1 });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);