const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a course description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['technology', 'business', 'design', 'marketing', 'personal-development', 'other']
  },
  level: {
    type: String,
    required: [true, 'Please add a difficulty level'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Please add course duration']
  },
  price: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  prerequisites: [{
    type: String
  }],
  learningOutcomes: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  enrolledStudents: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  totalEnrollments: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for lessons
CourseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Get total lessons count
CourseSchema.virtual('totalLessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  count: true
});

module.exports = mongoose.model('Course', CourseSchema);