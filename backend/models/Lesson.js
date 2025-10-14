const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  order: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'text', 'mixed'],
    required: true
  },
  content: {
    // For text lessons
    text: {
      type: String
    },
    // For video lessons
    videoUrl: {
      type: String
    },
    videoDuration: {
      type: Number // in minutes
    }
  },
  resources: [{
    title: String,
    url: String,
    type: String // pdf, doc, link, etc.
  }],
  duration: {
    type: Number, // in minutes
    required: true
  },
  isFree: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Index for efficient querying
LessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Lesson', LessonSchema);