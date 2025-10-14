const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: true
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true
  },
  description: {
    type: String
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer'],
      default: 'multiple-choice'
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String, // For short answer questions
    points: {
      type: Number,
      default: 1
    },
    explanation: String
  }],
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  timeLimit: {
    type: Number, // in minutes
    default: null
  },
  attempts: {
    type: Number,
    default: 3 // maximum attempts allowed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);