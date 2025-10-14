const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const CourseProgress = require('../models/CourseProgress');
const emailService = require('../services/emailService');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Only filter by published status for non-admin users
    // If user is admin or explicitly requesting all courses, show all
    if (req.query.includeAll !== 'true' && (!req.user || req.user.role !== 'admin')) {
      query.status = 'published';
    }

    // Filter by status if explicitly provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by level
    if (req.query.level) {
      query.level = req.query.level;
    }

    // Search
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .populate('totalLessons')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      count: courses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate({
        path: 'lessons',
        match: { status: 'published' },
        options: { sort: { order: 1 } }
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error while fetching course' });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user.id
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ message: 'Server error while creating course' });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error while updating course' });
  }
};

// Add new function to publish course
const publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.status = 'published';
    await course.save();

    // Send notifications to all users (async)
    (async () => {
      try {
        const users = await User.find({ 
          role: 'user',
          isActive: true,
          'subscriptions.newResources': true
        }).select('name email subscriptions');
        
        if (users.length > 0) {
          await emailService.sendNewCoursePublishedEmail(users, course);
        }
      } catch (error) {
        console.error('Failed to send course published emails:', error);
      }
    })();

    res.json({
      success: true,
      message: 'Course published successfully',
      data: course
    });
  } catch (error) {
    console.error('Publish course error:', error);
    res.status(500).json({ message: 'Server error while publishing course' });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete all related lessons
    await Lesson.deleteMany({ course: req.params.id });

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error while deleting course' });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
// Update enrollCourse function
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add student to course
    course.enrolledStudents.push(req.user.id);
    course.totalEnrollments += 1;
    await course.save();

    // Create progress record
    await CourseProgress.create({
      user: req.user.id,
      course: course._id,
      progressPercentage: 0
    });

    // Send enrollment confirmation email (async)
    emailService.sendCourseEnrollmentEmail(req.user, course).catch(error => {
      console.error('Failed to send enrollment email:', error);
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: course
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Server error while enrolling in course' });
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/courses/my-courses
// @access  Private
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ enrolledStudents: req.user.id })
      .populate('instructor', 'name email')
      .populate('totalLessons');

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await CourseProgress.findOne({
          user: req.user.id,
          course: course._id
        });

        return {
          ...course.toObject(),
          progress: progress ? progress.progressPercentage : 0,
          lastAccessed: progress ? progress.lastAccessedAt : null
        };
      })
    );

    res.json({
      success: true,
      count: coursesWithProgress.length,
      data: coursesWithProgress
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error while fetching enrolled courses' });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  enrollCourse,
  getMyCourses
};