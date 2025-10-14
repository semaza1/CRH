const mongoose = require('mongoose');

const CourseProgressSchema = new mongoose.Schema({
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
  completedLessons: [{
    lesson: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  quizResults: [{
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz'
    },
    attempts: Number,
    bestScore: Number,
    passed: Boolean
  }],
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  certificateIssued: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per user per course
CourseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);