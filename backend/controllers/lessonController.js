const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const emailService = require('../services/emailService');

// @desc    Get lessons for a course
// @route   GET /api/courses/:courseId/lessons
// @access  Private (enrolled students only)
const getLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.enrolledStudents.includes(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const lessons = await Lesson.find({ course: req.params.courseId, status: 'published' })
      .sort({ order: 1 });

    res.json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Server error while fetching lessons' });
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private
const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(lesson.course);
    if (!course.enrolledStudents.includes(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Server error while fetching lesson' });
  }
};

// @desc    Create lesson
// @route   POST /api/courses/:courseId/lessons
// @access  Private/Admin
const createLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessonData = {
      ...req.body,
      course: req.params.courseId
    };

    const lesson = await Lesson.create(lessonData);

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ message: 'Server error while creating lesson' });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private/Admin
const updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Server error while updating lesson' });
  }
};

// Update completeLesson function
const completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const course = await Course.findById(lesson.course).populate('instructor', 'name email');

    // Find or create progress record
    let progress = await CourseProgress.findOne({
      user: req.user.id,
      course: lesson.course
    });

    if (!progress) {
      return res.status(404).json({ message: 'Course progress not found. Please enroll first.' });
    }

    // Check if lesson already completed
    const alreadyCompleted = progress.completedLessons.some(
      cl => cl.lesson.toString() === lesson._id.toString()
    );

    if (!alreadyCompleted) {
      progress.completedLessons.push({
        lesson: lesson._id,
        completedAt: new Date()
      });

      // Calculate progress percentage
      const totalLessons = await Lesson.countDocuments({ course: lesson.course, status: 'published' });
      progress.progressPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);

      // Check if course is completed
      if (progress.progressPercentage === 100) {
        progress.completedAt = new Date();
        
        // Generate certificate (will implement this next)
        const Certificate = require('../models/Certificate');
        const certificate = await Certificate.create({
          user: req.user.id,
          course: course._id,
          completionDate: new Date()
        });
        
        progress.certificateIssued = true;
        
        // Send course completion email with certificate (async)
        emailService.sendCourseCompletionEmail(req.user, course, certificate).catch(error => {
          console.error('Failed to send course completion email:', error);
        });
      } else {
        // Send lesson completion email (async)
        emailService.sendLessonCompletionEmail(req.user, lesson, course, progress).catch(error => {
          console.error('Failed to send lesson completion email:', error);
        });
      }

      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      data: {
        progress: progress.progressPercentage,
        completedLessons: progress.completedLessons.length
      }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ message: 'Server error while completing lesson' });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Admin
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Server error while deleting lesson' });
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/lessons/:id/complete
// @access  Private
// (duplicate simple completeLesson removed) 

module.exports = {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson
};